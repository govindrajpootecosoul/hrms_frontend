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
      return NextResponse.json({ message: 'No files provided' }, { status: 400 });
    }

    // Validate file types - only accept Excel files
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const invalidFiles = [];
    for (const file of files) {
      const fileName = file.name?.split(/[/\\]/).pop() || '';
      const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExt)) {
        invalidFiles.push(fileName);
      }
    }

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { 
          message: `Invalid file type(s). Only Excel files (.xlsx, .xls) and CSV files are supported. Invalid files: ${invalidFiles.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), `amazon-gst-process-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const savedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalName = file.name?.split(/[/\\]/).pop() || `file_${i}`;
      const sanitizedName = sanitizeName(originalName);
      const filePath = join(tempDir, sanitizedName);
      await writeFile(filePath, buffer);
      savedFiles.push({ path: filePath, name: sanitizedName });
    }

    const scriptPath = join(process.cwd(), 'scripts', 'process_gst_files.py');
    const outputPath = join(tempDir, 'GST_Combined.xlsx');
    const inputPath = savedFiles.length === 1 ? savedFiles[0].path : tempDir;
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(
        pythonCommand,
        [scriptPath, '-i', inputPath, '-o', outputPath],
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
            console.error('Amazon GST Process stderr:', stderr);
            console.error('Amazon GST Process stdout:', stdout);
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
                'Content-Disposition': `attachment; filename="amazon_gst_processed_${Date.now()}.xlsx"`,
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
    console.error('Amazon GST Process API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

