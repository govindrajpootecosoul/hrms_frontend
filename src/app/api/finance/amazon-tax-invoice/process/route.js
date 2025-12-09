import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

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

    // Create temporary directory
    const tempDir = join(tmpdir(), `amazon-invoice-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Save uploaded files - flatten directory structure
    const pdfFiles = [];
    for (const file of files) {
      if (file.name && file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          // Extract just the filename, ignoring any folder structure in the name
          const fileName = file.name.split(/[/\\]/).pop(); // Get last part of path
          // Sanitize filename to remove any invalid characters
          const sanitizedFileName = fileName.replace(/[<>:"|?*]/g, '_');
          const filePath = join(tempDir, sanitizedFileName);
          await writeFile(filePath, buffer);
          pdfFiles.push(filePath);
        } catch (fileError) {
          console.error(`Error saving file ${file.name}:`, fileError);
          // Skip this file and continue with others
          continue;
        }
      }
    }

    if (pdfFiles.length === 0) {
      return NextResponse.json(
        { message: 'No valid PDF files could be saved. Please check file names and try again.' },
        { status: 400 }
      );
    }

    // Use the script from scripts directory
    const scriptPath = join(process.cwd(), 'scripts', 'amazon_tax_invoice_extractor.py');
    
    // Determine if input is a single file or multiple files (treat as folder)
    const inputPath = pdfFiles.length === 1 ? pdfFiles[0] : join(tempDir, 'input');
    
    // If multiple files, create input directory
    if (pdfFiles.length > 1) {
      await mkdir(inputPath, { recursive: true });
      for (const pdfFile of pdfFiles) {
        const fileName = pdfFile.split(/[/\\]/).pop();
        const destPath = join(inputPath, fileName);
        const fileBuffer = await readFile(pdfFile);
        await writeFile(destPath, fileBuffer);
      }
    }

    // Output Excel file path
    const outputPath = join(tempDir, 'output.xlsx');

    // Execute Python script with proper arguments
    // Try python3 first, fallback to python
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonCommand, [
        scriptPath,
        '-i', inputPath,
        '-o', outputPath
      ], {
        cwd: tempDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
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
        try {
          if (code !== 0) {
            console.error('Python script error:', stderr);
            return reject(NextResponse.json(
              { message: `Python script failed: ${stderr || 'Unknown error'}` },
              { status: 500 }
            ));
          }

          // Check if output file exists
          try {
            const excelBuffer = await readFile(outputPath);
            
            // Return the Excel file
            resolve(new NextResponse(excelBuffer, {
              headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="amazon_tax_invoices_${Date.now()}.xlsx"`,
              },
            }));
          } catch (fileError) {
            // If no output file, check if all files were excluded
            if (stderr.includes('excluded') || stdout.includes('excluded')) {
              return reject(NextResponse.json(
                { message: 'All files were excluded. Please check the files and try again.' },
                { status: 400 }
              ));
            }
            return reject(NextResponse.json(
              { message: 'Output file not generated. Processing may have failed.' },
              { status: 500 }
            ));
          }
        } catch (error) {
          reject(NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
          ));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Process error:', error);
        reject(NextResponse.json(
          { message: `Failed to execute Python script: ${error.message}. Make sure Python is installed.` },
          { status: 500 }
        ));
      });
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
