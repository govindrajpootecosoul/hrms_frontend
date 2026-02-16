import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import * as XLSX from 'xlsx';

const sanitizeName = (name) => name.replace(/[<>:"|?*]/g, '_');

/**
 * Check if a file path contains a 'B2B' worksheet (indicating it's a GST file)
 */
function hasB2BWorksheet(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, { sheetStubs: true });
    const sheetNames = workbook.SheetNames.map(name => name.toLowerCase());
    return sheetNames.includes('b2b');
  } catch (error) {
    return false;
  }
}

/**
 * Check filename patterns to guess file type
 */
function guessFileTypeFromName(fileName) {
  const name = fileName?.toLowerCase() || '';
  const gstKeywords = ['gstr', 'gst', 'b2b'];
  const booksKeywords = ['book', 'books', 'bookkeeping', 'accounting'];
  
  const hasGSTKeyword = gstKeywords.some(keyword => name.includes(keyword));
  const hasBooksKeyword = booksKeywords.some(keyword => name.includes(keyword));
  
  if (hasGSTKeyword && !hasBooksKeyword) return 'gst';
  if (hasBooksKeyword && !hasGSTKeyword) return 'books';
  return null;
}

/**
 * Automatically detect which file is GST and which is books
 * Returns indices: { gstIndex: 0 or 1, booksIndex: 0 or 1 }
 */
async function detectFileTypes(files, savedPaths) {
  if (files.length !== 2 || savedPaths.length !== 2) {
    return { gstIndex: 0, booksIndex: 1 };
  }
  
  const [file1, file2] = files;
  const [path1, path2] = savedPaths;
  
  // First, try filename-based detection
  const file1Type = guessFileTypeFromName(file1.name);
  const file2Type = guessFileTypeFromName(file2.name);
  
  if (file1Type === 'gst' && file2Type === 'books') {
    return { gstIndex: 0, booksIndex: 1 };
  }
  if (file1Type === 'books' && file2Type === 'gst') {
    return { gstIndex: 1, booksIndex: 0 };
  }
  
  // If filename detection is ambiguous, check file content for B2B worksheet
  const getExt = (path) => {
    const idx = path.toLowerCase().lastIndexOf('.');
    return idx >= 0 ? path.toLowerCase().substring(idx) : '';
  };
  
  const path1Ext = getExt(path1);
  const path2Ext = getExt(path2);
  
  // Check which file has B2B worksheet (only for Excel files)
  if (['.xlsx', '.xls'].includes(path1Ext)) {
    if (hasB2BWorksheet(path1)) {
      return { gstIndex: 0, booksIndex: 1 };
    }
  }
  
  if (['.xlsx', '.xls'].includes(path2Ext)) {
    if (hasB2BWorksheet(path2)) {
      return { gstIndex: 1, booksIndex: 0 };
    }
  }
  
  // If still ambiguous, default to original order
  return { gstIndex: 0, booksIndex: 1 };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length !== 2) {
      return NextResponse.json(
        {
          message:
            'Please upload exactly 2 files: 1 GST Excel file (B2B) and 1 bookkeeping CSV/Excel file.',
        },
        { status: 400 }
      );
    }

    // Create temp directory
    const tempDir = join(tmpdir(), `books-vs-gst-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Save both files first
    const saveUploadedFile = async (file, fallbackName) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName = file.name?.split(/[/\\]/).pop() || fallbackName;
      const sanitizedName = sanitizeName(originalName);
      const filePath = join(tempDir, sanitizedName);
      await writeFile(filePath, buffer);
      return filePath;
    };

    const savedPaths = [];
    for (const file of files) {
      const path = await saveUploadedFile(file, `file_${savedPaths.length}`);
      savedPaths.push(path);
    }

    // Automatically detect which file is GST and which is books
    const { gstIndex, booksIndex } = await detectFileTypes(files, savedPaths);
    const gstPath = savedPaths[gstIndex];
    const booksPath = savedPaths[booksIndex];

    // Validate file extensions
    const getExt = (path) => {
      const idx = path.toLowerCase().lastIndexOf('.');
      return idx >= 0 ? path.toLowerCase().substring(idx) : '';
    };

    const gstExt = getExt(gstPath);
    const booksExt = getExt(booksPath);

    const excelExts = ['.xlsx', '.xls'];
    const allowedBooksExts = ['.csv', '.xlsx', '.xls'];

    if (!excelExts.includes(gstExt)) {
      return NextResponse.json(
        {
          message:
            'Invalid GST file type. Please upload an Excel file (.xlsx or .xls) exported from the GST portal (B2B sheet).',
        },
        { status: 400 }
      );
    }

    if (!allowedBooksExts.includes(booksExt)) {
      return NextResponse.json(
        {
          message:
            'Invalid bookkeeping file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls) exported from your books.',
        },
        { status: 400 }
      );
    }

    const scriptPath = join(
      process.cwd(),
      'scripts',
      'combined_gst_book_reconcile.py'
    );
    const outputPath = join(
      tempDir,
      'books_vs_gst_reconciliation_output.csv'
    );
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    return new Promise((resolve, reject) => {
      const args = [
        scriptPath,
        '--gst-input',
        gstPath,
        '--books-input',
        booksPath,
        '--output',
        outputPath,
      ];

      const pythonProcess = spawn(pythonCommand, args, {
        cwd: tempDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      });

      let stderr = '';
      let stdout = '';

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        try {
          if (code !== 0) {
            console.error('Books vs GST Reconciliation stderr:', stderr);
            console.error('Books vs GST Reconciliation stdout:', stdout);
            
            // Extract meaningful error message from stdout/stderr
            let errorMessage = 'Unknown error occurred';
            
            // Check for common errors in stdout
            if (stdout.includes("Worksheet named 'B2B' not found")) {
              errorMessage = 'The GST file does not contain a "B2B" worksheet. Please ensure you upload a valid GST Excel file exported from the GST portal with a B2B sheet.';
            } else if (stdout.includes("No GST files processed successfully")) {
              errorMessage = 'No GST files could be processed. Please check:\n- First file is a valid GST Excel file (.xlsx, .xls) with a "B2B" worksheet\n- Second file is a valid bookkeeping CSV/Excel file (.csv, .xlsx, .xls)\n- Python and required packages are installed';
            } else if (stderr) {
              errorMessage = `Processing error: ${stderr.substring(0, 500)}`;
            } else if (stdout) {
              // Try to extract error from stdout
              const errorMatch = stdout.match(/Error[:\s]+(.+?)(?:\n|$)/i);
              if (errorMatch) {
                errorMessage = errorMatch[1].trim();
              } else {
                errorMessage = stdout.substring(0, 500);
              }
            }
            
            return reject(
              NextResponse.json(
                {
                  message: errorMessage,
                  details: stdout || stderr,
                },
                { status: 500 }
              )
            );
          }

          const outputBuffer = await readFile(outputPath);
          resolve(
            new NextResponse(outputBuffer, {
              headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="books_vs_gst_reconciliation_${Date.now()}.csv"`,
              },
            })
          );
        } catch (error) {
          console.error('Books vs GST Reconciliation read error:', error);
          reject(
            NextResponse.json(
              {
                message:
                  error.message || 'Failed to generate reconciliation output',
              },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Books vs GST Reconciliation spawn error:', error);
        reject(
          NextResponse.json(
            {
              message: `Failed to execute Python script: ${error.message}. Ensure Python and required packages (pandas, numpy, openpyxl) are installed on the server.`,
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error('Books vs GST Reconciliation API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



