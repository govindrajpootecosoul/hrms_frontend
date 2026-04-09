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

    if (files.length !== 7) {
      return NextResponse.json(
        { 
          message: 'Please provide exactly 7 files: India Platform, USA Platform, 3G Warehouse, Shipcube, Updike, Amazon Inventory, and Container Data files' 
        },
        { status: 400 }
      );
    }

    // Validate file types - all should be Excel files
    for (const file of files) {
      const fileName = file.name?.split(/[/\\]/).pop() || '';
      const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      
      if (fileExt !== '.xlsx' && fileExt !== '.xls') {
        return NextResponse.json(
          { 
            message: `Invalid file type: ${fileName}. Only Excel files (.xlsx, .xls) are supported.` 
          },
          { status: 400 }
        );
      }
    }

    const tempDir = join(tmpdir(), `meir-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Save files in order
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

    // Map files to their expected types (in order: india-platform, usa-platform, three-g, shipcube, updike, amazon, container)
    const inputFiles = {
      'india_platform': savedFiles[0].path,
      'usa_platform': savedFiles[1].path,
      'three_g': savedFiles[2].path,
      'shipcube': savedFiles[3].path,
      'updike': savedFiles[4].path,
      'amazon': savedFiles[5].path,
      'container': savedFiles[6].path
    };

    const scriptPath = join(process.cwd(), 'scripts', 'MEIR.py');
    const outputPath = join(tempDir, `MEIR_Output_${Date.now()}.xlsx`);
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(
        pythonCommand,
        [
          scriptPath,
          '--india-platform', inputFiles.india_platform,
          '--usa-platform', inputFiles.usa_platform,
          '--three-g', inputFiles.three_g,
          '--shipcube', inputFiles.shipcube,
          '--updike', inputFiles.updike,
          '--amazon', inputFiles.amazon,
          '--container', inputFiles.container,
          '--output', outputPath
        ],
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
            console.error('MEIR stderr:', stderr);
            console.error('MEIR stdout:', stdout);
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
                'Content-Disposition': `attachment; filename="MEIR_Output_${Date.now()}.xlsx"`,
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
    console.error('MEIR API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}





























