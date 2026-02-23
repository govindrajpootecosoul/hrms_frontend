import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAssetsCollection, getAssetCategoriesCollection } from '@/lib/mongodb';

// Maps Excel column names to asset form fields
const COLUMN_MAP = {
  // Basic Info
  assetTag: 'assetTag',
  'Asset Tag': 'assetTag',
  'AssetTag': 'assetTag',
  category: 'category',
  Category: 'category',
  subcategory: 'subcategory',
  Subcategory: 'subcategory',
  'Sub Category': 'subcategory',
  site: 'site',
  Site: 'site',
  location: 'location',
  Location: 'location',
  status: 'status',
  Status: 'status',
  
  // Assignment
  assignedTo: 'assignedTo',
  'Assigned To': 'assignedTo',
  AssignedTo: 'assignedTo',
  department: 'department',
  Department: 'department',
  
  // Specifications
  brand: 'brand',
  Brand: 'brand',
  model: 'model',
  Model: 'model',
  serialNumber: 'serialNumber',
  'Serial Number': 'serialNumber',
  SerialNumber: 'serialNumber',
  description: 'description',
  Description: 'description',
  
  // Processor
  processor: 'processor',
  Processor: 'processor',
  processorGeneration: 'processorGeneration',
  'Processor Generation': 'processorGeneration',
  ProcessorGeneration: 'processorGeneration',
  
  // RAM
  totalRAM: 'totalRAM',
  'Total RAM': 'totalRAM',
  TotalRAM: 'totalRAM',
  ram1Size: 'ram1Size',
  ramSize: 'ram1Size',  // Map ramSize to ram1Size
  'RAM Size': 'ram1Size',
  'Ram Size': 'ram1Size',
  RamSize: 'ram1Size',
  ram2Size: 'ram2Size',
  ramSize2: 'ram2Size',  // Map ramSize2 to ram2Size
  'RAM Size 2': 'ram2Size',
  'Ram Size 2': 'ram2Size',
  RamSize2: 'ram2Size',
  'Ram Manufacturer': 'ramManufacturer',  // New field for RAM manufacturer
  'RAM Manufacturer': 'ramManufacturer',
  
  // Graphics & OS
  'Graphic Card': 'graphicCard',  // New field for graphics card
  'Graphics Card': 'graphicCard',
  GraphicCard: 'graphicCard',
  'Window Version': 'windowVersion',  // New field for Windows version
  'Windows Version': 'windowVersion',
  WindowVersion: 'windowVersion',
  
  // Warranty
  warrantyStart: 'warrantyStart',
  'Warranty Start': 'warrantyStart',
  WarrantyStart: 'warrantyStart',
  warrantyMonths: 'warrantyMonths',
  'Warranty Months': 'warrantyMonths',
  WarrantyMonths: 'warrantyMonths',
  warrantyExpire: 'warrantyExpire',
  'Warranty Expire': 'warrantyExpire',
  WarrantyExpire: 'warrantyExpire',
  
  // Notes & Remarks
  notes: 'notes',
  Notes: 'notes',
  remark: 'notes',  // Map Remark to notes
  Remark: 'notes',
  'Remarks': 'notes',
  
  // Company
  company: 'company',
  Company: 'company',
  'Buy By': 'company',
  buyBy: 'company',
  BuyBy: 'company',
};

function validateAsset(row, rowNumber) {
  const errors = [];
  
  // Only these fields are REQUIRED - all others are optional and can be filled in later via UI
  const required = ['category', 'subcategory', 'site', 'location', 'brand', 'model', 'serialNumber'];
  
  for (const field of required) {
    const val = row[field];
    // Check if value exists and is not empty after trimming
    if (val === null || val === undefined || val === '' || (typeof val === 'string' && !val.trim())) {
      errors.push(`${field} is required`);
    }
  }

  // Validate status only if provided (it's optional, defaults to 'available')
  // Accept both lowercase and capitalized values
  if (row.status && row.status.trim()) {
    const statusLower = row.status.trim().toLowerCase();
    const validStatuses = ['available', 'assigned', 'maintenance', 'broken', 'unassigned', 'under maintenance', 'damaged'];
    if (!validStatuses.includes(statusLower)) {
      errors.push(`status must be one of: available, assigned, maintenance, broken (received: ${row.status})`);
    }
  }

  return errors;
}

const DEFAULT_CATEGORY_PREFIX_MAP = {
  'computerassets::laptop': 'CA-LAP',
  'computerassets::desktop': 'CA-DESK',
  'computerassets::server': 'CA-SRV',
  'externalequipment::bag': 'EE-BAG',
  'externalequipment::charger': 'EE-CHG',
  'externalequipment::keyboard': 'EE-KBD',
  'externalequipment::lcdmonitor': 'EE-LCD',
  'externalequipment::lcdmonitors': 'EE-LCD',
  'externalequipment::mouse': 'EE-MSE',
  'officesupplies::printer': 'OS-PRT',
  'officesupplies::scanner': 'OS-SCN',
};

function normalizeKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildCategoryPrefixMap(categories = []) {
  const prefixMap = { ...DEFAULT_CATEGORY_PREFIX_MAP };
  for (const category of categories) {
    const categoryName = normalizeKey(category?.name);
    if (!categoryName) continue;

    for (const subcategory of category?.subcategories || []) {
      const subcategoryName = normalizeKey(subcategory?.name);
      const tagPrefix = String(subcategory?.tagPrefix || '').trim().toUpperCase();
      if (!subcategoryName || !tagPrefix) continue;
      prefixMap[`${categoryName}::${subcategoryName}`] = tagPrefix;
    }
  }
  return prefixMap;
}

function deriveTagPrefix(category, subcategory, categoryPrefixMap) {
  const normalizedCategory = normalizeKey(category);
  const normalizedSubcategory = normalizeKey(subcategory);
  const mapped = categoryPrefixMap[`${normalizedCategory}::${normalizedSubcategory}`];
  if (mapped) return mapped;

  const categoryCode = normalizeKey(category).slice(0, 2).toUpperCase().padEnd(2, 'X');
  const subcategoryCode = normalizeKey(subcategory).slice(0, 3).toUpperCase().padEnd(3, 'X');
  return `${categoryCode}-${subcategoryCode}`;
}

async function getNextAssetTag(prefix, assetsCollection, sequenceCache, reservedTags) {
  if (!sequenceCache.has(prefix)) {
    const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`, 'i');
    const existingTags = await assetsCollection
      .find({ assetTag: { $regex: regex } }, { projection: { assetTag: 1 } })
      .toArray();

    let maxSequence = 0;
    for (const doc of existingTags) {
      const tag = String(doc?.assetTag || '');
      const numberPart = Number(tag.split('-').pop());
      if (Number.isInteger(numberPart) && numberPart > maxSequence) {
        maxSequence = numberPart;
      }
    }

    sequenceCache.set(prefix, maxSequence + 1);
  }

  let nextSequence = sequenceCache.get(prefix);
  let candidateTag = `${prefix}-${String(nextSequence).padStart(3, '0')}`;
  while (reservedTags.has(candidateTag.toLowerCase())) {
    nextSequence += 1;
    candidateTag = `${prefix}-${String(nextSequence).padStart(3, '0')}`;
  }

  sequenceCache.set(prefix, nextSequence + 1);
  reservedTags.add(candidateTag.toLowerCase());
  return candidateTag;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const companyId = formData.get('companyId') || '';
    const company = formData.get('company') || ''; // Get company name from formData

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Company name is REQUIRED for proper data isolation
    if (!company || company.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Company name is required for bulk upload' },
        { status: 400 }
      );
    }

    console.log(`[BulkUpload] Processing upload for company: ${company}, companyId: ${companyId}`);

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // Helper function to normalize and map column names
    // Returns the mapped field name (value from COLUMN_MAP), not the original key
    const normalizeColumnName = (key) => {
      if (!key) return null;
      const trimmed = key.trim();
      
      // First try exact match - return the mapped value
      if (COLUMN_MAP[trimmed]) return COLUMN_MAP[trimmed];
      
      // Then try case-insensitive match
      const lowerKey = trimmed.toLowerCase();
      const found = Object.keys(COLUMN_MAP).find(k => k.toLowerCase() === lowerKey);
      if (found) return COLUMN_MAP[found];
      
      // Then try removing spaces and matching
      const noSpaces = trimmed.replace(/\s+/g, '');
      const foundNoSpaces = Object.keys(COLUMN_MAP).find(k => k.replace(/\s+/g, '').toLowerCase() === noSpaces.toLowerCase());
      if (foundNoSpaces) return COLUMN_MAP[foundNoSpaces];
      
      return null;
    };

    // Debug: Log the first row's column names to help diagnose mapping issues
    if (rows.length > 0) {
      const excelColumns = Object.keys(rows[0]);
      console.log('📊 Excel columns found:', excelColumns);
      console.log('📊 Total columns:', excelColumns.length);
      console.log('📊 First row sample:', rows[0]);
      
      // Log which columns are being mapped
      const mappedColumns = {};
      excelColumns.forEach(col => {
        const mapped = normalizeColumnName(col);
        if (mapped) {
          mappedColumns[col] = mapped;
        }
      });
      console.log('✅ Mapped columns:', mappedColumns);
      
      // Log unmapped columns
      const unmappedColumns = excelColumns.filter(col => !normalizeColumnName(col));
      if (unmappedColumns.length > 0) {
        console.log('⚠️ Unmapped columns (will be ignored):', unmappedColumns);
      }
      
      // Check if Company column exists
      const hasCompanyColumn = excelColumns.some(key => 
        key.toLowerCase().includes('company') || 
        key.toLowerCase().includes('buy') ||
        key === 'Company' || 
        key === 'company' ||
        key === 'Buy By'
      );
      console.log('Company column detected:', hasCompanyColumn);
      if (hasCompanyColumn) {
        const companyCol = excelColumns.find(key => 
          key.toLowerCase().includes('company') || 
          key.toLowerCase().includes('buy') ||
          key === 'Company' || 
          key === 'company' ||
          key === 'Buy By'
        );
        console.log('Company column name:', companyCol, 'Value:', rows[0][companyCol]);
      }
    }

    const collection = await getAssetsCollection(company);
    const categoriesCollection = await getAssetCategoriesCollection();
    const categoriesDoc = await categoriesCollection.findOne({ companyId: companyId || 'default' });
    const categoryPrefixMap = buildCategoryPrefixMap(categoriesDoc?.categories || []);
    const sequenceCache = new Map();
    const reservedTags = new Set();

    const created = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      // Check if row is empty (all values are empty strings or null/undefined)
      const hasData = Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '');
      if (!hasData) {
        continue; // Skip empty rows
      }

      // Normalize column names (handle case variations and spaces)
      // All fields except required ones are optional - can be left empty and filled in later via UI
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        const mappedKey = normalizeColumnName(key);
        if (mappedKey) {
          const value = row[key];
          // For optional fields, empty values are allowed (will be null/empty string)
          // Required fields will be validated separately
          normalizedRow[mappedKey] = (value === '' || value === null || value === undefined) ? '' : String(value).trim();
        }
      });

      // Debug: Log normalized row for first few rows
      if (i < 3) {
        console.log(`Row ${rowNumber} normalized:`, normalizedRow);
        console.log(`Row ${rowNumber} company field:`, normalizedRow.company || '(empty)');
      }

      const errors = validateAsset(normalizedRow, rowNumber);
      
      if (errors.length > 0) {
        errorCount++;
        rowErrors.push({
          rowNumber,
          assetTag: normalizedRow.assetTag || `Row ${rowNumber}`,
          errors,
        });
        continue;
      }

      if (normalizedRow.assetTag && normalizedRow.assetTag.trim()) {
        reservedTags.add(normalizedRow.assetTag.trim().toLowerCase());
      }

      // Generate assetTag if missing
      if (!normalizedRow.assetTag || !normalizedRow.assetTag.trim()) {
        const prefix = deriveTagPrefix(normalizedRow.category, normalizedRow.subcategory, categoryPrefixMap);
        normalizedRow.assetTag = await getNextAssetTag(prefix, collection, sequenceCache, reservedTags);
      }

      // Normalize status value - handle both lowercase and capitalized values
      let status = normalizedRow.status?.trim() || 'available';
      const statusLower = status.toLowerCase();
      if (statusLower === 'assigned') {
        status = 'assigned';
      } else if (statusLower === 'available' || statusLower === 'unassigned') {
        status = 'available';
      } else if (statusLower === 'maintenance' || statusLower === 'under maintenance') {
        status = 'maintenance';
      } else if (statusLower === 'broken' || statusLower === 'damaged') {
        status = 'broken';
      } else {
        status = 'available'; // Default to available if status is invalid
      }

      // Create asset object
      // Optional fields can be empty - they can be updated later via the UI edit form
      // Note: company field is ALWAYS set from formData (required) to ensure consistency
      // Excel company column is ignored to prevent mismatches
      const asset = {
        id: Date.now().toString() + i,
        companyId: companyId || 'default', // Add companyId to asset (from formData)
        ...normalizedRow,
        company: company, // ALWAYS use company from formData (required) - ignore Excel company column to ensure consistency
        status: status,
        // Ensure optional fields are set to empty string if not provided (not null/undefined)
        description: normalizedRow.description || '',
        processor: normalizedRow.processor || '',
        processorGeneration: normalizedRow.processorGeneration || '',
        totalRAM: normalizedRow.totalRAM || '',
        ram1Size: normalizedRow.ram1Size || '',
        ram2Size: normalizedRow.ram2Size || '',
        ramManufacturer: normalizedRow.ramManufacturer || '', // New field for RAM manufacturer
        graphicCard: normalizedRow.graphicCard || '', // New field for graphics card
        windowVersion: normalizedRow.windowVersion || '', // New field for Windows version
        warrantyStart: normalizedRow.warrantyStart || '',
        warrantyMonths: normalizedRow.warrantyMonths || '',
        warrantyExpire: normalizedRow.warrantyExpire || '',
        assignedTo: normalizedRow.assignedTo || '',
        department: normalizedRow.department || '',
        notes: normalizedRow.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      created.push(asset);
      createdCount++;
    }

    // Save created assets to MongoDB using company-specific collection
    if (created.length > 0) {
      try {
        // Debug: Log first asset to verify company field
        if (created.length > 0) {
          console.log(`[BulkUpload] Sample asset being saved:`, {
            assetTag: created[0].assetTag,
            company: created[0].company,
            companyId: created[0].companyId
          });
        }
        
        const result = await collection.insertMany(created);
        console.log(`✅ Saved ${result.insertedCount} assets to MongoDB for company: ${company}`);
        console.log(`✅ Database used: ${company} → ${company.toLowerCase().replace(/\s+/g, '_')}_asset_tracker`);
      } catch (dbError) {
        console.error('❌ Error saving assets to MongoDB:', dbError);
        console.error('❌ Company:', company, 'CompanyId:', companyId);
        return NextResponse.json(
          { success: false, error: `Failed to save assets to database: ${dbError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      created,
      createdCount,
      errorCount,
      rowErrors,
      message: `Processed ${rows.length} rows: ${createdCount} created, ${errorCount} errors`,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}

