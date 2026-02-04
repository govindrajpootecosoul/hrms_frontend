import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAssetsCollection } from '@/lib/mongodb';

// Maps Excel column names to asset form fields
const COLUMN_MAP = {
  assetTag: 'assetTag',
  category: 'category',
  subcategory: 'subcategory',
  site: 'site',
  location: 'location',
  status: 'status',
  brand: 'brand',
  model: 'model',
  serialNumber: 'serialNumber',
  description: 'description',
  processor: 'processor',
  processorGeneration: 'processorGeneration',
  totalRAM: 'totalRAM',
  ram1Size: 'ram1Size',
  ram2Size: 'ram2Size',
  warrantyStart: 'warrantyStart',
  warrantyMonths: 'warrantyMonths',
  warrantyExpire: 'warrantyExpire',
  assignedTo: 'assignedTo',
  department: 'department',
  notes: 'notes',
  company: 'company',  // Company name from Excel (Thrive, Ecosoul Home, etc.)
  Company: 'company',
  'Buy By': 'company',  // Also support "Buy By" column name
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
  if (row.status && row.status.trim() && !['available', 'assigned', 'maintenance', 'broken'].includes(row.status.trim().toLowerCase())) {
    errors.push(`status must be one of: available, assigned, maintenance, broken`);
  }

  return errors;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const companyId = formData.get('companyId') || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

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

    // Debug: Log the first row's column names to help diagnose mapping issues
    if (rows.length > 0) {
      console.log('Excel columns found:', Object.keys(rows[0]));
      console.log('First row sample:', rows[0]);
      
      // Check if Company column exists
      const hasCompanyColumn = Object.keys(rows[0]).some(key => 
        key.toLowerCase().includes('company') || 
        key.toLowerCase().includes('buy') ||
        key === 'Company' || 
        key === 'company' ||
        key === 'Buy By'
      );
      console.log('Company column detected:', hasCompanyColumn);
      if (hasCompanyColumn) {
        const companyCol = Object.keys(rows[0]).find(key => 
          key.toLowerCase().includes('company') || 
          key.toLowerCase().includes('buy') ||
          key === 'Company' || 
          key === 'company' ||
          key === 'Buy By'
        );
        console.log('Company column name:', companyCol, 'Value:', rows[0][companyCol]);
      }
    }

    const created = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;

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

      // Generate assetTag if missing
      if (!normalizedRow.assetTag || !normalizedRow.assetTag.trim()) {
        const categoryMapping = {
          'Computer Assets': {
            'Laptop': 'CA-LAP',
            'Desktop': 'CA-DESK',
          },
          'External Equipment': {
            'Bag': 'EE-BAG',
            'Charger': 'EE-CHG',
            'Keyboard': 'EE-KBD',
            'LCD-Monitors': 'EE-LCD',
            'Mouse': 'EE-MSE',
          },
        };
        const prefix = categoryMapping[normalizedRow.category]?.[normalizedRow.subcategory];
        if (prefix) {
          const randomNum = Math.floor(Math.random() * 900) + 100;
          normalizedRow.assetTag = `${prefix}-${randomNum}`;
        }
      }

      // Normalize status value
      let status = normalizedRow.status?.trim().toLowerCase() || 'available';
      if (!['available', 'assigned', 'maintenance', 'broken'].includes(status)) {
        status = 'available';
      }

      // Create asset object
      // Optional fields can be empty - they can be updated later via the UI edit form
      // Note: company field is set explicitly before spread to ensure it's stored
      const asset = {
        id: Date.now().toString() + i,
        companyId: companyId || 'default', // Add companyId to asset (from formData)
        ...normalizedRow,
        company: normalizedRow.company || '', // Store company name from Excel (Thrive, Ecosoul Home, etc.) - set after spread to ensure it's not overwritten
        status: status,
        // Ensure optional fields are set to empty string if not provided (not null/undefined)
        description: normalizedRow.description || '',
        processor: normalizedRow.processor || '',
        processorGeneration: normalizedRow.processorGeneration || '',
        totalRAM: normalizedRow.totalRAM || '',
        ram1Size: normalizedRow.ram1Size || '',
        ram2Size: normalizedRow.ram2Size || '',
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

    // Save created assets to MongoDB
    if (created.length > 0) {
      try {
        const collection = await getAssetsCollection();
        const result = await collection.insertMany(created);
        console.log(`✅ Saved ${result.insertedCount} assets to MongoDB`);
      } catch (dbError) {
        console.error('❌ Error saving assets to MongoDB:', dbError);
        // Don't fail the request, but log the error
        // Assets are still returned in the response, but won't persist
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

