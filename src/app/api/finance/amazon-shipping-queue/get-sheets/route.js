import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), `excel-sheets-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name?.split(/[/\\]/).pop() || 'temp.xlsx';
    const filePath = join(tempDir, fileName);
    await writeFile(filePath, buffer);

    // Use Python to read Excel sheets
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const script = `
import pandas as pd
import sys
import json

try:
    excel_file = pd.ExcelFile(sys.argv[1])
    sheets = excel_file.sheet_names
    print(json.dumps({"sheets": sheets}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonCommand, ['-c', script, filePath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      });

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
        try {
          await unlink(filePath);
        } catch (e) {
          // Ignore cleanup errors
        }

        if (code !== 0) {
          return reject(
            NextResponse.json(
              { message: `Failed to read Excel file: ${stderr || 'Unknown error'}` },
              { status: 500 }
            )
          );
        }

        try {
          const result = JSON.parse(stdout);
          if (result.error) {
            return reject(
              NextResponse.json(
                { message: result.error },
                { status: 500 }
              )
            );
          }
          return resolve(
            NextResponse.json({ sheets: result.sheets || [] })
          );
        } catch (parseError) {
          return reject(
            NextResponse.json(
              { message: 'Failed to parse Python output' },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on('error', (error) => {
        return reject(
          NextResponse.json(
            { message: `Failed to start Python: ${error.message}` },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error('Get sheets error:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

