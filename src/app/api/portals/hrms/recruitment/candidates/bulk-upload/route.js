import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/utils/constants';

// Maps Excel column names to candidate form fields
const COLUMN_MAP = {
  'Candidate Name': 'candidateName',
  'candidate name': 'candidateName',
  'candidateName': 'candidateName',
  'Name': 'candidateName',
  'name': 'candidateName',
  'Contact Number': 'contactNumber',
  'contact number': 'contactNumber',
  'contactNumber': 'contactNumber',
  'Phone': 'contactNumber',
  'phone': 'contactNumber',
  'Email': 'email',
  'email': 'email',
  'Current Location': 'currentLocation',
  'current location': 'currentLocation',
  'currentLocation': 'currentLocation',
  'Location': 'currentLocation',
  'location': 'currentLocation',
  'Calling Date': 'callingDate',
  'calling date': 'callingDate',
  'callingDate': 'callingDate',
  'Current Organisation': 'currentOrganisation',
  'current organisation': 'currentOrganisation',
  'currentOrganisation': 'currentOrganisation',
  'Organisation': 'currentOrganisation',
  'organisation': 'currentOrganisation',
  'Company': 'currentOrganisation',
  'company': 'currentOrganisation',
  'Education': 'education',
  'education': 'education',
  'Total Experience': 'totalExperience',
  'total experience': 'totalExperience',
  'totalExperience': 'totalExperience',
  'Experience': 'totalExperience',
  'experience': 'totalExperience',
  'Assigned To': 'assignedTo',
  'assigned to': 'assignedTo',
  'assignedTo': 'assignedTo',
  'Recruiter': 'assignedTo',
  'recruiter': 'assignedTo',
  'Status': 'status',
  'status': 'status',
  'Current CTC (Fixed)': 'currentCTCFixed',
  'current ctc (fixed)': 'currentCTCFixed',
  'currentCTCFixed': 'currentCTCFixed',
  'Current CTC Fixed': 'currentCTCFixed',
  'Current CTC': 'currentCTCFixed',
  'current ctc': 'currentCTCFixed',
  'Current CTC (In-hand)': 'currentCTCInHand',
  'current ctc (in-hand)': 'currentCTCInHand',
  'currentCTCInHand': 'currentCTCInHand',
  'Current CTC In-hand': 'currentCTCInHand',
  'Expected CTC': 'expectedCTC',
  'expected ctc': 'expectedCTC',
  'expectedCTC': 'expectedCTC',
  'Notice Period': 'noticePeriod',
  'notice period': 'noticePeriod',
  'noticePeriod': 'noticePeriod',
  'Willing to Work in Startup': 'willingToWorkInStartup',
  'willing to work in startup': 'willingToWorkInStartup',
  'willingToWorkInStartup': 'willingToWorkInStartup',
  'Willing to Work in Startup': 'willingToWorkInStartup',
  'Communication Skills': 'communicationSkills',
  'communication skills': 'communicationSkills',
  'communicationSkills': 'communicationSkills',
  'Recruiter Feedback': 'recruiterFeedback',
  'recruiter feedback': 'recruiterFeedback',
  'recruiterFeedback': 'recruiterFeedback',
  'Interviewer Feedback': 'interviewerFeedback',
  'interviewer feedback': 'interviewerFeedback',
  'interviewerFeedback': 'interviewerFeedback',
  'Remark': 'remark',
  'remark': 'remark',
  'Folder Name': 'folderName',
  'folder name': 'folderName',
  'folderName': 'folderName',
  'Folder': 'folderName',
  'folder': 'folderName',
};

function normalizeColumnName(colName) {
  if (!colName) return '';
  return colName.toString().trim();
}

function mapRowToCandidate(row, rowNumber) {
  const candidate = {};
  const errors = [];

  // Map each column to candidate field
  Object.keys(row).forEach((colName) => {
    const normalizedCol = normalizeColumnName(colName);
    const fieldName = COLUMN_MAP[normalizedCol];
    
    if (fieldName) {
      let value = row[colName];
      
      // Handle empty values
      if (value === null || value === undefined || value === '') {
        candidate[fieldName] = '';
        return;
      }

      // Convert to string and trim
      value = String(value).trim();

      // Special handling for date fields
      if (fieldName === 'callingDate') {
        // Try to parse Excel date serial number or date string
        if (value && !isNaN(value) && value > 25569) {
          // Excel date serial number (days since 1900-01-01)
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(excelEpoch.getTime() + (parseFloat(value) - 1) * 86400000);
          candidate[fieldName] = date.toISOString().split('T')[0];
        } else if (value) {
          // Try to parse date string
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            candidate[fieldName] = date.toISOString().split('T')[0];
          } else {
            candidate[fieldName] = value; // Keep original if can't parse
          }
        }
      } else if (fieldName === 'currentCTCFixed' || fieldName === 'currentCTCInHand' || fieldName === 'expectedCTC') {
        // Handle numeric fields
        if (value) {
          const numValue = parseFloat(value);
          candidate[fieldName] = isNaN(numValue) ? 0 : numValue;
        } else {
          candidate[fieldName] = 0;
        }
      } else {
        candidate[fieldName] = value;
      }
    }
  });

  // All fields are optional - only validate format when values are provided

  // Email validation (only if email is provided)
  if (candidate.email && candidate.email.toString().trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation (only if phone is provided)
  if (candidate.contactNumber && candidate.contactNumber.toString().trim() !== '' && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(candidate.contactNumber.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }

  // Status validation
  const validStatuses = ['New', 'Shortlisted', 'In Interview', 'Interview Scheduled', 'Hired', 'On Hold'];
  if (candidate.status && !validStatuses.includes(candidate.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Communication Skills validation
  const validCommSkills = ['Excellent', 'Very Good', 'Good', 'Average', 'Poor'];
  if (candidate.communicationSkills && !validCommSkills.includes(candidate.communicationSkills)) {
    errors.push(`Communication Skills must be one of: ${validCommSkills.join(', ')}`);
  }

  // Willing to Work in Startup validation
  if (candidate.willingToWorkInStartup && !['Yes', 'No'].includes(candidate.willingToWorkInStartup)) {
    errors.push('Willing to Work in Startup must be Yes or No');
  }

  return { candidate, errors };
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

    const candidates = [];
    const rowErrors = [];
    let createdCount = 0;
    let errorCount = 0;

    // Process each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and header is row 1
      const { candidate, errors } = mapRowToCandidate(row, rowNumber);

      // Only add errors for format validation issues, not missing required fields
      if (errors.length > 0) {
        rowErrors.push({ row: rowNumber, errors });
        // Don't skip the candidate - still add it even if there are format errors
        // errorCount++;
        // return;
      }

      // Set default values for optional fields
      candidate.currentCTCInHand = candidate.currentCTCInHand || 0;
      candidate.recruiterFeedback = candidate.recruiterFeedback || '';
      candidate.interviewerFeedback = candidate.interviewerFeedback || '';
      candidate.remark = candidate.remark || '';
      candidate.assignDate = new Date().toISOString().split('T')[0];

      candidates.push(candidate);
      createdCount++;
    });

    // Allow empty candidates - all fields are optional
    // Removed the check that required at least one valid candidate

    // Send candidates to backend in batches
    const token = request.headers.get('authorization') || '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }
    if (company) {
      headers['x-company'] = company;
    }

    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates/bulk-upload`;
    
    // Send all candidates at once
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        candidates,
        company,
        companyId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend error: ${response.status}`,
          errors: rowErrors.length > 0 ? rowErrors : undefined
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      created: createdCount,
      errors: rowErrors.length > 0 ? rowErrors : undefined,
      message: `Successfully imported ${createdCount} candidate(s).${errorCount > 0 ? ` ${errorCount} row(s) had errors.` : ''}`,
      data: data.data || data,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}

