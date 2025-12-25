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
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length !== 2) {
      return NextResponse.json(
        { message: 'Please upload exactly 2 files: main_data CSV and country Excel file' },
        { status: 400 }
      );
    }

    if (!sheetName) {
      return NextResponse.json(
        { message: 'Sheet name is required' },
        { status: 400 }
      );
    }

    const tempDir = join(tmpdir(), `amazon-shipping-queue-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Identify CSV and Excel files
    let csvFile = null;
    let excelFile = null;

    for (const file of files) {
      const fileName = file.name?.split(/[/\\]/).pop() || '';
      const lowerName = fileName.toLowerCase();
      
      if (lowerName.endsWith('.csv')) {
        csvFile = file;
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        excelFile = file;
      }
    }

    if (!csvFile) {
      return NextResponse.json(
        { message: 'Could not find CSV file. Please upload main_data CSV file.' },
        { status: 400 }
      );
    }

    if (!excelFile) {
      return NextResponse.json(
        { message: 'Could not find Excel file. Please upload country-specific Excel file.' },
        { status: 400 }
      );
    }

    // Save files
    const csvBytes = await csvFile.arrayBuffer();
    const csvBuffer = Buffer.from(csvBytes);
    const csvPath = join(tempDir, sanitizeName(csvFile.name.split(/[/\\]/).pop()));
    await writeFile(csvPath, csvBuffer);

    const excelBytes = await excelFile.arrayBuffer();
    const excelBuffer = Buffer.from(excelBytes);
    const excelPath = join(tempDir, sanitizeName(excelFile.name.split(/[/\\]/).pop()));
    await writeFile(excelPath, excelBuffer);

    // Sheet validation will be done by Python script

    // Run Python script
    const scriptPath = join(process.cwd(), 'scripts', 'find_missing_shipments.py');
    const outputPath = join(tempDir, `missing_shipments_${Date.now()}.xlsx`);
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const args = [scriptPath, csvPath, excelPath, sheetName, outputPath];

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
        if (code !== 0) {
          console.error('Python script error:', stderr);
          return reject(
            NextResponse.json(
              { 
                message: `Python script failed: ${stderr || stdout || 'Unknown error'}` 
              },
              { status: 500 }
            )
          );
        }

        try {
          // Check if script said no missing shipments
          if (stdout.includes('No missing Shipment IDs found') || stdout.includes('No missing shipments found')) {
            return resolve(
              NextResponse.json(
                { message: 'No missing Shipment IDs found. All Shipment IDs from main_data exist in country file.' },
                { status: 200 }
              )
            );
          }

          // Check if output file exists
          const outputExists = await readFile(outputPath).catch(() => null);
          
          if (!outputExists) {
            return reject(
              NextResponse.json(
                { message: 'Output file was not created. Check Python script execution.' },
                { status: 500 }
              )
            );
          }

          // Read and return the output file
          const outputBuffer = await readFile(outputPath);
          
          return resolve(
            new NextResponse(outputBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="missing_shipments_${sheetName}_${Date.now()}.xlsx"`,
              },
            })
          );
        } catch (error) {
          console.error('Error reading output file:', error);
          return reject(
            NextResponse.json(
              { message: `Error reading output file: ${error.message}` },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Python process error:', error);
        return reject(
          NextResponse.json(
            { 
              message: `Failed to start Python process: ${error.message}. Make sure Python is installed.` 
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error('Amazon Shipping Queue processing error:', error);
    return NextResponse.json(
      { message: `Processing error: ${error.message}` },
      { status: 500 }
    );
  }
}

