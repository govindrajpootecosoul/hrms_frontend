import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

const sanitizeName = (name) => name.replace(/[<>:"|?*]/g, '_');

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
            'Please upload exactly 2 files: 1 GST Excel file (B2B) and 1 bookkeeping CSV/Excel file, in that order.',
        },
        { status: 400 }
      );
    }

    const [gstFile, booksFile] = files;

    const getExt = (file) => {
      const name = file.name?.split(/[/\\]/).pop() || '';
      const idx = name.lastIndexOf('.');
      return idx >= 0 ? name.toLowerCase().substring(idx) : '';
    };

    const gstExt = getExt(gstFile);
    const booksExt = getExt(booksFile);

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

    // Create temp directory
    const tempDir = join(tmpdir(), `books-vs-gst-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Save GST and Books files
    const saveUploadedFile = async (file, fallbackName) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName = file.name?.split(/[/\\]/).pop() || fallbackName;
      const sanitizedName = sanitizeName(originalName);
      const filePath = join(tempDir, sanitizedName);
      await writeFile(filePath, buffer);
      return filePath;
    };

    const gstPath = await saveUploadedFile(gstFile, 'gst_input.xlsx');
    const booksPath = await saveUploadedFile(booksFile, 'books_input.csv');

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
            return reject(
              NextResponse.json(
                {
                  message: `Python script failed: ${
                    stderr || 'Unknown error'
                  }`,
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



