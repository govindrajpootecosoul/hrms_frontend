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
    const sheetName = formData.get('sheetName');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files provided' }, { status: 400 });
    }

    if (files.length < 2) {
      return NextResponse.json(
        { message: 'Please provide 2 files: main_data CSV and country Excel file' },
        { status: 400 }
      );
    }

    // Validate file types
    const csvFiles = [];
    const excelFiles = [];
    
    for (const file of files) {
      const fileName = file.name?.split(/[/\\]/).pop() || '';
      const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      
      if (fileExt === '.csv') {
        csvFiles.push(file);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        excelFiles.push(file);
      } else {
        return NextResponse.json(
          { 
            message: `Invalid file type: ${fileName}. Only CSV and Excel files (.xlsx, .xls) are supported.` 
          },
          { status: 400 }
        );
      }
    }

    if (csvFiles.length === 0) {
      return NextResponse.json(
        { message: 'Please provide at least one CSV file (main_data)' },
        { status: 400 }
      );
    }

    if (excelFiles.length === 0) {
      return NextResponse.json(
        { message: 'Please provide at least one Excel file (country file)' },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), `amazon-missing-shipment-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const savedFiles = [];
    let mainDataPath = null;
    let countryFilePath = null;

    // Save files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName = file.name?.split(/[/\\]/).pop() || `file_${i}`;
      const sanitizedName = sanitizeName(originalName);
      const filePath = join(tempDir, sanitizedName);
      await writeFile(filePath, buffer);
      
      const fileExt = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));
      if (fileExt === '.csv' && !mainDataPath) {
        mainDataPath = filePath;
      } else if ((fileExt === '.xlsx' || fileExt === '.xls') && !countryFilePath) {
        countryFilePath = filePath;
      }
      
      savedFiles.push({ path: filePath, name: sanitizedName });
    }

    // If we don't have both files identified, use first CSV and first Excel
    if (!mainDataPath && csvFiles.length > 0) {
      const csvFile = csvFiles[0];
      const csvName = csvFile.name?.split(/[/\\]/).pop() || '';
      mainDataPath = join(tempDir, sanitizeName(csvName));
    }

    if (!countryFilePath && excelFiles.length > 0) {
      const excelFile = excelFiles[0];
      const excelName = excelFile.name?.split(/[/\\]/).pop() || '';
      countryFilePath = join(tempDir, sanitizeName(excelName));
    }

    // If sheet name not provided, get first sheet from Excel file using Python
    let selectedSheet = sheetName;
    if (!selectedSheet) {
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      try {
        const getSheetsProcess = spawn(
          pythonCommand,
          ['-c', `
import pandas as pd
import sys
try:
    excel_file = pd.ExcelFile(r"${countryFilePath}")
    print(excel_file.sheet_names[0] if excel_file.sheet_names else "")
except Exception as e:
    sys.exit(1)
          `],
          {
            cwd: tempDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
          }
        );

        let stdout = '';
        getSheetsProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        await new Promise((resolve, reject) => {
          getSheetsProcess.on('close', (code) => {
            if (code === 0 && stdout.trim()) {
              selectedSheet = stdout.trim();
            } else {
              selectedSheet = 'Sheet1'; // Default fallback
            }
            resolve();
          });
          getSheetsProcess.on('error', reject);
        });
      } catch (error) {
        selectedSheet = 'Sheet1'; // Default fallback
      }
    }

    const scriptPath = join(process.cwd(), 'scripts', 'find_missing_shipments.py');
    const outputPath = join(tempDir, `missing_shipments_${Date.now()}.xlsx`);
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(
        pythonCommand,
        [scriptPath, '-m', mainDataPath, '-c', countryFilePath, '-s', selectedSheet, '-o', outputPath],
        {
          cwd: tempDir,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        },
      );

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
            console.error('Amazon Missing Shipment stderr:', stderr);
            console.error('Amazon Missing Shipment stdout:', stdout);
            return reject(
              NextResponse.json(
                { message: `Python script failed: ${stderr || 'Unknown error'}` },
                { status: 500 },
              ),
            );
          }

          const outputBuffer = await readFile(outputPath);
          resolve(
            new NextResponse(outputBuffer, {
              headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="amazon_missing_shipments_${Date.now()}.xlsx"`,
              },
            }),
          );
        } catch (error) {
          reject(
            NextResponse.json(
              { message: error.message || 'Failed to generate output file' },
              { status: 500 },
            ),
          );
        }
      });

      pythonProcess.on('error', (error) => {
        reject(
          NextResponse.json(
            { message: `Failed to execute Python script: ${error.message}. Ensure Python is installed.` },
            { status: 500 },
          ),
        );
      });
    });
  } catch (error) {
    console.error('Amazon Missing Shipment API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

