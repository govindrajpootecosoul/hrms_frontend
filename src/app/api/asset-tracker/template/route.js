import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

const TEMPLATE_COLUMNS = [
  // Matches `AssetForm` + table usage in `asset-tracker`
  // REQUIRED FIELDS (must be filled):
  'category', // REQUIRED
  'subcategory', // REQUIRED
  'site', // REQUIRED
  'location', // REQUIRED
  'brand', // REQUIRED
  'model', // REQUIRED
  'serialNumber', // REQUIRED
  // OPTIONAL FIELDS (can be left empty and updated later):
  'assetTag', // optional; if blank we'll generate during upload
  'status', // optional: available | assigned | maintenance | broken (defaults to 'available')
  'company', // optional: Company name (Thrive, Ecosoul Home, etc.) - used for filtering assets by company
  'description', // optional
  'processor', // optional
  'processorGeneration', // optional
  'totalRAM', // optional
  'ram1Size', // optional
  'ram2Size', // optional
  'warrantyStart', // optional (format: yyyy-mm-dd)
  'warrantyMonths', // optional
  'warrantyExpire', // optional (format: yyyy-mm-dd)
  'assignedTo', // optional
  'department', // optional
  'notes', // optional
];

export async function GET() {
  const wb = XLSX.utils.book_new();

  // Header row + one example row (kept minimal but helpful)
  // Note: Required fields are filled, optional fields can be left empty
  const rows = [
    TEMPLATE_COLUMNS,
    [
      // REQUIRED FIELDS (must be filled):
      'Computer Assets', // category
      'Laptop', // subcategory
      'Head Office', // site
      'India', // location
      'Dell', // brand
      'Latitude 5520', // model
      'DL123456789', // serialNumber
      // OPTIONAL FIELDS (can be left empty):
      '', // assetTag (will be auto-generated if empty)
      'available', // status (optional, defaults to 'available')
      'Thrive', // company (optional: Thrive, Ecosoul Home, etc.)
      'Developer laptop', // description
      'Intel Core i7', // processor
      '11th Gen', // processorGeneration
      '16GB', // totalRAM
      '8GB', // ram1Size
      '8GB', // ram2Size
      '2025-01-15', // warrantyStart
      '36', // warrantyMonths
      '2028-01-15', // warrantyExpire
      '', // assignedTo
      'IT Department', // department
      'Optional notes', // notes
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Basic column sizing for readability
  ws['!cols'] = TEMPLATE_COLUMNS.map((c) => ({
    wch: Math.max(14, c.length + 2),
  }));

  XLSX.utils.book_append_sheet(wb, ws, 'Assets');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="asset-upload-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}

