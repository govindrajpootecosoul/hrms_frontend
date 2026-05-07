import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/utils/constants';

function normalizeHeader(value) {
  const raw = (value ?? '').toString().trim();
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();
  if (!s) return '';

  // Excel serial number
  const n = Number(s);
  if (!Number.isNaN(n) && n > 25569) {
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (n - 1) * 86400000);
    return Number.isNaN(date.getTime()) ? s : date.toISOString().split('T')[0];
  }

  // dd.mm.yyyy or dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // yyyy-mm-dd or any Date-parsable string
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString().split('T')[0];
}

function fieldForHeader(normalizedHeader, occurrenceIndex) {
  switch (normalizedHeader) {
    case 'name':
      return 'name';
    case 'father husband name':
      return 'fatherName';
    case 'dob':
      return 'dateOfBirth';
    case 'doj':
      return 'joiningDate';
    case 'age':
      return 'age';
    case 'gender':
      return 'gender';
    case 'mobile number':
      return occurrenceIndex === 0 ? 'phone' : 'emergencyPhone';
    case 'adhaar number':
    case 'aadhar number':
    case 'aadhaar number':
      return 'aadhaar';
    case 'ration number':
      return 'rationNumber';
    case 'pan card':
      return 'pan';
    case 'current address':
      return 'presentAddress';
    case 'permanent address':
      return 'permanentAddress';
    case 'job title':
      return 'jobTitle';
    case 'deparment':
    case 'department':
      return 'department';
    case 'bank name':
      return 'bankName';
    case 'a c no':
    case 'a c no ':
    case 'a c no.':
    case 'a c no .':
    case 'a c no  ':
    case 'a c no  .':
    case 'a c no. ':
    case 'a c no . ':
    case 'a c no':
    case 'a c no ':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
    case 'a c no':
    case 'a c no.':
      return 'bankAccount';
    case 'ifsc code':
      return 'ifsc';
    case 'branch name':
      return 'bankBranchName';
    case 'emergency contact name':
      return 'emergencyContact';
    case 'relation':
      return 'emergencyRelation';
    case 'uan number':
      return 'uan';
    case 'esic':
      return 'esiNo';
    case 'family details':
      return 'familyDetails';
    case 'location':
      return 'location';
    default:
      return null;
  }
}

function mapRowToEmployeeFromHeaderRow(headerRow, valueRow) {
  const employee = {};
  const errors = [];

  const occurrenceByHeader = new Map();

  for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
    const headerNorm = normalizeHeader(headerRow[colIdx]);
    if (!headerNorm) continue;

    const prev = occurrenceByHeader.get(headerNorm) || 0;
    occurrenceByHeader.set(headerNorm, prev + 1);
    const occurrenceIndex = prev; // 0-based

    const field = fieldForHeader(headerNorm, occurrenceIndex);
    if (!field) continue;

    let value = valueRow[colIdx];
    if (value === null || value === undefined) value = '';
    value = String(value).trim();

    if (field === 'dateOfBirth' || field === 'joiningDate') {
      employee[field] = parseExcelDate(value);
    } else {
      employee[field] = value;
    }
  }

  // Minimal validation
  if (!employee.name || employee.name.trim() === '') errors.push('Name is required');
  if (!employee.location || employee.location.trim() === '') errors.push('Location is required');

  // Normalize gender if provided
  if (employee.gender) {
    const g = employee.gender.toString().trim().toLowerCase();
    if (g === 'm' || g === 'male') employee.gender = 'Male';
    else if (g === 'f' || g === 'female') employee.gender = 'Female';
    else if (g === 'other') employee.gender = 'Other';
  }

  return { employee, errors };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const companyId = formData.get('companyId') || '';
    const company = formData.get('company') || '';
    const logPrefix = '[warehouse-employees bulk-upload]';

    if (!file) {
      console.error(`${logPrefix} No file provided`);
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const table = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
    const headerRow = Array.isArray(table?.[0]) ? table[0] : [];
    const dataRows = Array.isArray(table) ? table.slice(1) : [];

    if (dataRows.length === 0) {
      console.error(`${logPrefix} Excel file is empty`);
      return NextResponse.json({ success: false, error: 'Excel file is empty' }, { status: 400 });
    }

    const created = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;
    let generatedEmployeeCounter = 0;

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2: header row is 1
      const isBlank = !Array.isArray(row) || row.every((c) => String(c ?? '').trim() === '');
      if (isBlank) return;

      const { employee, errors } = mapRowToEmployeeFromHeaderRow(headerRow, row);

      if (errors.length > 0) {
        console.error(`${logPrefix} Row validation failed`, { row: rowNumber, errors, row });
        rowErrors.push({ row: rowNumber, errors });
        errorCount++;
        return;
      }

      if (!employee.employeeId || employee.employeeId.trim() === '') {
        generatedEmployeeCounter += 1;
        const maxEmployeeNumber = generatedEmployeeCounter + 1000;
        employee.employeeId = `EMP${String(maxEmployeeNumber).padStart(3, '0')}`;
      } else {
        employee.employeeId = employee.employeeId.toUpperCase();
      }

      const employeeData = {
        employeeId: employee.employeeId,
        name: (employee.name || '').toString().trim(),
        location: (employee.location || '').toString().trim(),
        active: (employee.status || 'Active').toString().trim().toLowerCase() === 'inactive' ? false : true,
        bankAccount: employee.bankAccount || '',
        ifsc: employee.ifsc || '',
        bankName: employee.bankName || '',
        pan: employee.pan || '',
        aadhaar: employee.aadhaar || '',
        ...employee,
      };

      created.push({ rowNumber, employeeData });
    });

    const resolvedCompany = String(company || companyId || '').trim();
    if (!resolvedCompany) {
      console.error(`${logPrefix} Company missing`, { companyId, company });
      return NextResponse.json({ success: false, error: 'Company is required for employee upload' }, { status: 400 });
    }

    console.error(`${logPrefix} Starting upload`, {
      company: resolvedCompany,
      totalRows: dataRows.length,
      validRows: created.length,
      invalidRows: rowErrors.length,
      sheetName,
    });

    const token = request.headers.get('authorization') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = token;

    const savedEmployees = [];

    for (const item of created) {
      const { rowNumber, employeeData } = item;
      try {
        const backendResponse = await fetch(
          `${API_BASE_URL}/admin-warehouse-users?company=${encodeURIComponent(resolvedCompany)}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...employeeData, company: resolvedCompany }),
          }
        );

        const backendData = await backendResponse.json().catch(() => null);
        if (!backendResponse.ok || !backendData?.success) {
          console.error(`${logPrefix} Backend save failed`, {
            row: rowNumber,
            status: backendResponse.status,
            backendError: backendData?.error,
            responseBody: backendData,
            employeeData,
          });
          rowErrors.push({
            row: rowNumber,
            errors: [backendData?.error || `Failed to save employee (HTTP ${backendResponse.status})`],
          });
          errorCount++;
          continue;
        }

        if (backendData.user) {
          savedEmployees.push({ ...backendData.user, status: backendData.user.active === false ? 'Inactive' : 'Active' });
        } else {
          const status = employeeData.active === false ? 'Inactive' : 'Active';
          savedEmployees.push({ ...employeeData, id: `${Date.now()}-${rowNumber}`, status });
        }

        createdCount++;
      } catch (persistError) {
        console.error(`${logPrefix} Unexpected persist error`, { row: rowNumber, error: persistError, employeeData });
        rowErrors.push({ row: rowNumber, errors: [persistError?.message || 'Failed to save employee'] });
        errorCount++;
      }
    }

    console.error(`${logPrefix} Finished upload`, { createdCount, errorCount });
    return NextResponse.json({
      success: createdCount > 0,
      created: createdCount,
      errors: rowErrors.length > 0 ? rowErrors : undefined,
      employees: savedEmployees,
      message: `Successfully imported ${createdCount} employee(s).${errorCount > 0 ? ` ${errorCount} row(s) had errors.` : ''}`,
    });
  } catch (error) {
    console.error('[warehouse-employees bulk-upload] Unhandled error', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process Excel file' }, { status: 500 });
  }
}

