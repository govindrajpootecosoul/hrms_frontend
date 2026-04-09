import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

const MODE_REQUIREMENTS = {
  amazon: {
    requiredCount: 3,
    expected: ['mtr', 'b2c', 'stock'],
  },
  retail: {
    requiredCount: 2,
    expected: ['invoice', 'credit'],
  },
  jio: {
    requiredCount: 1,
    expected: ['jio'],
  },
  merge: {
    minFiles: 2,
    expected: [],
  },
};

const sanitizeName = (name) => name.replace(/[<>:"|?*]/g, '_');

const pickFileByKeyword = (files, keyword) =>
  files.find((f) => f.name.toLowerCase().includes(keyword));

export async function POST(request) {
  try {
    const formData = await request.formData();
    const modeRaw = formData.get('mode');
    const mode = typeof modeRaw === 'string' ? modeRaw.toLowerCase() : '';
    const files = formData.getAll('files');

    if (!MODE_REQUIREMENTS[mode]) {
      return NextResponse.json(
        { message: 'Invalid mode. Use one of: amazon, retail, jio, merge.' },
        { status: 400 },
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 },
      );
    }

    const tempDir = join(tmpdir(), `gst-${mode}-${Date.now()}`);
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

    const requirement = MODE_REQUIREMENTS[mode];
    if (requirement.requiredCount && savedFiles.length !== requirement.requiredCount) {
      return NextResponse.json(
        { message: `Please upload exactly ${requirement.requiredCount} file(s) for ${mode}.` },
        { status: 400 },
      );
    }
    if (!requirement.requiredCount && requirement.minFiles && savedFiles.length < requirement.minFiles) {
      return NextResponse.json(
        { message: `Please upload at least ${requirement.minFiles} file(s) for ${mode}.` },
        { status: 400 },
      );
    }

    const scriptPath = join(process.cwd(), 'scripts', 'gst_reconcile.py');
    const outputPath = join(tempDir, `gst_${mode}_output.csv`);
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const args = [scriptPath, '--mode', mode, '--output', outputPath];

    if (mode === 'amazon') {
      const mtr = pickFileByKeyword(savedFiles, 'mtr') || savedFiles[0];
      const b2c = pickFileByKeyword(savedFiles, 'b2c') || savedFiles[1];
      const stock = pickFileByKeyword(savedFiles, 'stock') || savedFiles[2];
      if (!mtr || !b2c || !stock) {
        return NextResponse.json(
          { message: 'Please upload MTR, B2C, and Stock files for Amazon mode.' },
          { status: 400 },
        );
      }
      args.push('--mtr', mtr.path, '--b2c', b2c.path, '--stock', stock.path);
    } else if (mode === 'retail') {
      const invoice = pickFileByKeyword(savedFiles, 'invoice') || savedFiles[0];
      const credit = pickFileByKeyword(savedFiles, 'credit') || savedFiles[1];
      if (!invoice || !credit) {
        return NextResponse.json(
          { message: 'Please upload Invoice and Credit files for Retail mode.' },
          { status: 400 },
        );
      }
      args.push('--invoice', invoice.path, '--credit', credit.path);
    } else if (mode === 'jio') {
      args.push('--jio', savedFiles[0].path);
    } else if (mode === 'merge') {
      args.push('--files', ...savedFiles.map((f) => f.path));
    }

    return new Promise((resolve, reject) => {
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
            console.error('GST Reconcile stderr:', stderr);
            console.error('GST Reconcile stdout:', stdout);
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
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="gst_${mode}_${Date.now()}.csv"`,
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
    console.error('GST Reconcile API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

