import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/utils/constants';

// Maps Excel column names to employee form fields
const COLUMN_MAP = {
  'Status': 'status',
  'status': 'status',
  'Status *': 'status',
  'Full Name': 'fullName',
  'full name': 'fullName',
  'FullName': 'fullName',
  'fullName': 'fullName',
  'First Name': 'firstName',
  'first name': 'firstName',
  'firstName': 'firstName',
  'First Name *': 'firstName',
  'Last Name': 'lastName',
  'last name': 'lastName',
  'lastName': 'lastName',
  'Last Name *': 'lastName',
  'Email': 'email',
  'email': 'email',
  'Email *': 'email',
  'Password': 'password',
  'password': 'password',
  'Phone': 'phone',
  'phone': 'phone',
  'Phone *': 'phone',
  'Date of Birth': 'dateOfBirth',
  'date of birth': 'dateOfBirth',
  'dateOfBirth': 'dateOfBirth',
  'Date of Birth *': 'dateOfBirth',
  'DOB': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'Actual DOB': 'actualDob',
  'actual dob': 'actualDob',
  'ActualDob': 'actualDob',
  'actualDob': 'actualDob',
  'Gender': 'gender',
  'gender': 'gender',
  'Gender *': 'gender',
  'Personal Email Id': 'personalEmail',
  'personal email id': 'personalEmail',
  'Personal Email': 'personalEmail',
  'personalEmail': 'personalEmail',
  "Father's Name": 'fatherName',
  'Father Name': 'fatherName',
  'fatherName': 'fatherName',
  'Marital Status': 'maritalStatus',
  'marital status': 'maritalStatus',
  'maritalStatus': 'maritalStatus',
  'Blood Group': 'bloodGroup',
  'blood group': 'bloodGroup',
  'bloodGroup': 'bloodGroup',
  'Present Address': 'presentAddress',
  'present address': 'presentAddress',
  'presentAddress': 'presentAddress',
  'Permanent Address': 'permanentAddress',
  'permanent address': 'permanentAddress',
  'permanentAddress': 'permanentAddress',
  'Work Phone': 'workPhone',
  'work phone': 'workPhone',
  'workPhone': 'workPhone',
  'Home Phone': 'homePhone',
  'home phone': 'homePhone',
  'homePhone': 'homePhone',
  'Emergency Phone': 'emergencyPhone',
  'emergency phone': 'emergencyPhone',
  'emergencyPhone': 'emergencyPhone',
  'Emergency Phone *': 'emergencyPhone',
  'Employee ID': 'employeeId',
  'employee id': 'employeeId',
  'employeeId': 'employeeId',
  'Employee ID *': 'employeeId',
  'Emp Code': 'emp_code',
  'emp code': 'emp_code',
  'EMP CODE': 'emp_code',
  'emp_code': 'emp_code',
  'Card No': 'card_no',
  'card no': 'card_no',
  'Card Number': 'card_no',
  'card_no': 'card_no',
  'Job Title': 'jobTitle',
  'job title': 'jobTitle',
  'jobTitle': 'jobTitle',
  'Job Title *': 'jobTitle',
  'Department': 'department',
  'department': 'department',
  'Department *': 'department',
  'Company': 'company',
  'company': 'company',
  'Location': 'location',
  'location': 'location',
  'Location *': 'location',
  'Reporting Manager': 'reportingManager',
  'reporting manager': 'reportingManager',
  'reportingManager': 'reportingManager',
  'Reporting Manager *': 'reportingManager',
  'Joining Date': 'joiningDate',
  'joining date': 'joiningDate',
  'joiningDate': 'joiningDate',
  'Joining Date *': 'joiningDate',
  'Exit Date': 'exitDate',
  'exit date': 'exitDate',
  'exitDate': 'exitDate',
  'Role': 'role',
  'role': 'role',
  'Has Credential Access': 'hasCredentialAccess',
  'has credential access': 'hasCredentialAccess',
  'Has Subscription Access': 'hasSubscriptionAccess',
  'has subscription access': 'hasSubscriptionAccess',
  'Bank Account Number': 'bankAccount',
  'bank account number': 'bankAccount',
  'bankAccount': 'bankAccount',
  'Bank Account': 'bankAccount',
  'IFSC Code': 'ifsc',
  'ifsc code': 'ifsc',
  'ifsc': 'ifsc',
  'IFSC': 'ifsc',
  'PAN Number': 'pan',
  'pan number': 'pan',
  'pan': 'pan',
  'PAN': 'pan',
  'Aadhaar Number': 'aadhaar',
  'aadhaar number': 'aadhaar',
  'aadhaar': 'aadhaar',
  'Aadhaar': 'aadhaar',
  'UAN Number': 'uan',
  'uan number': 'uan',
  'uan': 'uan',
  'UAN': 'uan',
  'ESI Number': 'esiNo',
  'esi number': 'esiNo',
  'esiNo': 'esiNo',
  'ESI': 'esiNo',
  'PF Number': 'pfNo',
  'pf number': 'pfNo',
  'pfNo': 'pfNo',
  'PF': 'pfNo',
};

function normalizeColumnName(colName) {
  if (!colName) return '';
  return colName.toString().trim();
}

function mapRowToEmployee(row, rowNumber) {
  const employee = {};
  const errors = [];

  // Map each column to employee field
  Object.keys(row).forEach((colName) => {
    const normalizedCol = normalizeColumnName(colName);
    const fieldName = COLUMN_MAP[normalizedCol];
    
    if (fieldName) {
      let value = row[colName];
      
      // Handle empty values
      if (value === null || value === undefined || value === '') {
        employee[fieldName] = '';
        return;
      }

      // Convert to string and trim
      value = String(value).trim();

      // Special handling for boolean fields (Yes/No, True/False, 1/0)
      if (fieldName === 'hasCredentialAccess' || fieldName === 'hasSubscriptionAccess') {
        const lc = value.toLowerCase();
        if (lc === 'yes' || lc === 'y' || lc === 'true' || lc === '1') employee[fieldName] = true;
        else if (lc === 'no' || lc === 'n' || lc === 'false' || lc === '0') employee[fieldName] = false;
        else employee[fieldName] = value; // let backend coerce / ignore; we will validate below
        return;
      }

      // Special handling for date fields
      if (fieldName === 'dateOfBirth' || fieldName === 'actualDob' || fieldName === 'joiningDate' || fieldName === 'exitDate') {
        // Try to parse Excel date serial number or date string
        if (value && !isNaN(value) && value > 25569) {
          // Excel date serial number (days since 1900-01-01)
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(excelEpoch.getTime() + (parseFloat(value) - 1) * 86400000);
          employee[fieldName] = date.toISOString().split('T')[0];
        } else if (value) {
          // Try to parse date string
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            employee[fieldName] = date.toISOString().split('T')[0];
          } else {
            employee[fieldName] = value; // Keep original if can't parse
          }
        }
      } else {
        employee[fieldName] = value;
      }
    }
  });

  // Minimal validation aligned with admin portal form (mostly optional),
  // but require an email to avoid creating unusable/duplicate-less records.
  if (!employee.email || employee.email.trim() === '') {
    errors.push('Email is required');
  }

  // Normalize name: accept either Full Name or First+Last
  const full = (employee.fullName || '').toString().trim();
  const first = (employee.firstName || '').toString().trim();
  const last = (employee.lastName || '').toString().trim();
  employee.name = full || `${first} ${last}`.trim();
  if (employee.name) {
    employee.name = employee.name.replace(/\s+/g, ' ').trim();
  }

  // Email validation
  if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.push('Invalid email format');
  }

  // Password validation (optional)
  if (employee.password && employee.password.trim() !== '' && employee.password.trim().length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Phone validation (basic)
  if (employee.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(employee.phone)) {
    errors.push('Invalid phone number format');
  }

  // Gender validation
  if (employee.gender && !['Male', 'Female', 'Other'].includes(employee.gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  // Status/exitDate validation
  const statusLc = (employee.status || 'Active').toString().trim().toLowerCase();
  if (employee.status && !['active', 'inactive'].includes(statusLc)) {
    errors.push('Status must be Active or Inactive');
  }
  if (statusLc === 'inactive') {
    if (!employee.exitDate || employee.exitDate.toString().trim() === '') {
      errors.push('Exit Date is required when Status is Inactive');
    }
  }

  // Role validation (optional)
  if (employee.role && !['user', 'admin'].includes(employee.role.toString().trim().toLowerCase())) {
    errors.push('Role must be user or admin');
  }

  // Boolean validation (optional)
  const boolFields = ['hasCredentialAccess', 'hasSubscriptionAccess'];
  for (const f of boolFields) {
    if (employee[f] === '' || employee[f] === undefined) continue;
    if (typeof employee[f] === 'boolean') continue;
    const lc = employee[f].toString().trim().toLowerCase();
    if (!['yes', 'no', 'true', 'false', '1', '0', 'y', 'n'].includes(lc)) {
      errors.push(`${f} must be Yes/No`);
    }
  }

  return { employee, errors };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const companyId = formData.get('companyId') || '';
    const company = formData.get('company') || '';

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

    const created = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;
    let generatedEmployeeCounter = 0;

    // Process each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and header is row 1
      const { employee, errors } = mapRowToEmployee(row, rowNumber);

      if (errors.length > 0) {
        rowErrors.push({ row: rowNumber, errors });
        errorCount++;
        return;
      }

      // Auto-generate Employee ID if not provided
      if (!employee.employeeId || employee.employeeId.trim() === '') {
        generatedEmployeeCounter += 1;
        const maxEmployeeNumber = generatedEmployeeCounter + 1000;
        employee.employeeId = `EMP${String(maxEmployeeNumber).padStart(3, '0')}`;
      } else {
        employee.employeeId = employee.employeeId.toUpperCase();
      }

      // Calculate tenure from joining date
      if (employee.joiningDate) {
        const joiningDate = new Date(employee.joiningDate);
        const today = new Date();
        let years = today.getFullYear() - joiningDate.getFullYear();
        let months = today.getMonth() - joiningDate.getMonth();

        if (months < 0) {
          years--;
          months += 12;
        }

        employee.tenure = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
      }

      // Prepare employee data for backend save
      const employeeData = {
        employeeId: employee.employeeId,
        name: employee.name || '',
        jobTitle: employee.jobTitle,
        department: employee.department,
        location: employee.location,
        active:
          (employee.status || 'Active').toString().trim().toLowerCase() === 'inactive'
            ? false
            : true,
        tenure: employee.tenure || '0 years 0 months',
        joiningDate: employee.joiningDate,
        email: employee.email,
        phone: employee.phone,
        ...employee,
      };

      created.push({ rowNumber, employeeData });
    });

    const resolvedCompany = String(company || companyId || '').trim();
    if (!resolvedCompany) {
      return NextResponse.json(
        { success: false, error: 'Company is required for employee upload' },
        { status: 400 }
      );
    }

    const token = request.headers.get('authorization') || '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = token;
    }

    const savedEmployees = [];

    // Persist each valid row into backend DB via admin-users API.
    for (const item of created) {
      const { rowNumber, employeeData } = item;
      try {
        const companyFromRow = String(employeeData.company || '').trim();
        const companyToUse = companyFromRow || resolvedCompany;

        const backendResponse = await fetch(
          `${API_BASE_URL}/admin-users?company=${encodeURIComponent(companyToUse)}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ...employeeData,
              company: companyToUse,
            }),
          }
        );

        const backendData = await backendResponse.json().catch(() => null);
        if (!backendResponse.ok || !backendData?.success) {
          rowErrors.push({
            row: rowNumber,
            errors: [backendData?.error || `Failed to save employee (HTTP ${backendResponse.status})`],
          });
          errorCount++;
          continue;
        }

        if (backendData.user) {
          savedEmployees.push({
            ...backendData.user,
            status: backendData.user.active === false ? 'Inactive' : 'Active',
          });
        } else {
          savedEmployees.push({
            ...employeeData,
            id: `${Date.now()}-${rowNumber}`,
            status: employeeData.active === false ? 'Inactive' : 'Active',
          });
        }
        createdCount++;
      } catch (persistError) {
        rowErrors.push({
          row: rowNumber,
          errors: [persistError?.message || 'Failed to save employee'],
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: createdCount > 0,
      created: createdCount,
      errors: rowErrors.length > 0 ? rowErrors : undefined,
      employees: savedEmployees,
      message: `Successfully imported ${createdCount} employee(s).${errorCount > 0 ? ` ${errorCount} row(s) had errors.` : ''}`,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}




