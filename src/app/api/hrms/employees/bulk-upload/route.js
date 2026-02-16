import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Maps Excel column names to employee form fields
const COLUMN_MAP = {
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
  'Phone': 'phone',
  'phone': 'phone',
  'Phone *': 'phone',
  'Date of Birth': 'dateOfBirth',
  'date of birth': 'dateOfBirth',
  'dateOfBirth': 'dateOfBirth',
  'Date of Birth *': 'dateOfBirth',
  'DOB': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'Gender': 'gender',
  'gender': 'gender',
  'Gender *': 'gender',
  'Address': 'address',
  'address': 'address',
  'Address *': 'address',
  'City': 'city',
  'city': 'city',
  'City *': 'city',
  'State': 'state',
  'state': 'state',
  'State *': 'state',
  'Zip Code': 'zipCode',
  'zip code': 'zipCode',
  'zipCode': 'zipCode',
  'Zip Code *': 'zipCode',
  'Postal Code': 'zipCode',
  'postal code': 'zipCode',
  'Emergency Contact': 'emergencyContact',
  'emergency contact': 'emergencyContact',
  'emergencyContact': 'emergencyContact',
  'Emergency Contact *': 'emergencyContact',
  'Emergency Phone': 'emergencyPhone',
  'emergency phone': 'emergencyPhone',
  'emergencyPhone': 'emergencyPhone',
  'Emergency Phone *': 'emergencyPhone',
  'Employee ID': 'employeeId',
  'employee id': 'employeeId',
  'employeeId': 'employeeId',
  'Employee ID *': 'employeeId',
  'Job Title': 'jobTitle',
  'job title': 'jobTitle',
  'jobTitle': 'jobTitle',
  'Job Title *': 'jobTitle',
  'Department': 'department',
  'department': 'department',
  'Department *': 'department',
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

      // Special handling for date fields
      if (fieldName === 'dateOfBirth' || fieldName === 'joiningDate') {
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

  // Validate required fields (Phase 1-3)
  const requiredFields = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: 'Emergency Phone',
    jobTitle: 'Job Title',
    department: 'Department',
    location: 'Location',
    reportingManager: 'Reporting Manager',
    joiningDate: 'Joining Date',
  };

  Object.keys(requiredFields).forEach((field) => {
    if (!employee[field] || employee[field].trim() === '') {
      errors.push(`${requiredFields[field]} is required`);
    }
  });

  // Email validation
  if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation (basic)
  if (employee.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(employee.phone)) {
    errors.push('Invalid phone number format');
  }

  // Gender validation
  if (employee.gender && !['Male', 'Female', 'Other'].includes(employee.gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  return { employee, errors };
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

    const created = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;

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
        const maxEmployeeNumber = createdCount + 1000; // Simple incrementing for now
        employee.employeeId = `EMP${String(maxEmployeeNumber + createdCount + 1).padStart(3, '0')}`;
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

      // Prepare employee data
      const employeeData = {
        id: Date.now().toString() + createdCount,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        jobTitle: employee.jobTitle,
        department: employee.department,
        location: employee.location,
        status: 'Active',
        tenure: employee.tenure || '0 years 0 months',
        joiningDate: employee.joiningDate,
        email: employee.email,
        phone: employee.phone,
        ...employee,
      };

      created.push(employeeData);
      createdCount++;
    });

    return NextResponse.json({
      success: true,
      created: createdCount,
      errors: rowErrors.length > 0 ? rowErrors : undefined,
      employees: created,
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



