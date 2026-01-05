import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

const sanitizeName = (name) => name.replace(/[<>:"|?*]/g, '_');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name?.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (fileExt !== '.xlsx' && fileExt !== '.xls') {
      return NextResponse.json(
        { message: 'File must be an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), `amazon-missing-shipment-sheets-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name?.split(/[/\\]/).pop() || 'file';
    const sanitizedName = sanitizeName(originalName);
    const filePath = join(tempDir, sanitizedName);
    await writeFile(filePath, buffer);

    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(
        pythonCommand,
        ['-c', `
import pandas as pd
import sys
import json

try:
    excel_file = pd.ExcelFile(r"${filePath}")
    sheets = excel_file.sheet_names
    print(json.dumps({"sheets": sheets}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
        `],
        {
          cwd: tempDir,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        },
      );

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // Clean up temp file
        await unlink(filePath).catch(() => {});

        if (code !== 0) {
          return reject(
            NextResponse.json(
              { message: `Error reading Excel file: ${stderr || 'Unknown error'}` },
              { status: 500 },
            ),
          );
        }

        try {
          const result = JSON.parse(stdout);
          if (result.error) {
            return reject(
              NextResponse.json(
                { message: `Error reading Excel file: ${result.error}` },
                { status: 500 },
              ),
            );
          }
          resolve(NextResponse.json({ sheets: result.sheets }));
        } catch (error) {
          return reject(
            NextResponse.json(
              { message: `Error parsing Python output: ${error.message}` },
              { status: 500 },
            ),
          );
        }
      });

      pythonProcess.on('error', async (error) => {
        await unlink(filePath).catch(() => {});
        reject(
          NextResponse.json(
            { message: `Failed to execute Python: ${error.message}. Ensure Python is installed.` },
            { status: 500 },
          ),
        );
      });
    });
  } catch (error) {
    console.error('Get Sheets API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

