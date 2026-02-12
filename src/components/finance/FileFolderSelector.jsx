'use client';

import { useState, useRef } from 'react';
import { Upload, FolderOpen, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';

const FileFolderSelector = ({ feature, onClose, apiEndpoint }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [fileStatuses, setFileStatuses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(feature?.id === 'gst-reconcile' ? 'amazon' : '');
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const toast = useToast();

  const isGstFeature = feature?.id === 'gst-reconcile';
  const isGstFileProcessing = feature?.id === 'gst-file-processing' || feature?.id === 'amazon-gst-process';
  const isMissingShipment = feature?.id === 'amazon-missing-shipment';
  const isMeir = feature?.id === 'meir';
  const isBookReconcile = feature?.id === 'book-reconcile';
  const isBooksVsGst = feature?.id === 'books-vs-gst-reconciliation';
  const allowedExtensions = isGstFeature || isGstFileProcessing || isMissingShipment || isMeir || isBookReconcile || isBooksVsGst ? ['.csv', '.xlsx', '.xls'] : ['.pdf'];
  const acceptString = allowedExtensions.join(',');

  const MODE_REQUIREMENTS = {
    amazon: {
      label: 'Amazon (MTR, B2C, Stock)',
      requiredCount: 3,
      hint: 'Upload exactly 3 files: MTR B2B, B2C, and Stock transfer CSVs (any order).',
    },
    retail: {
      label: 'Retail & Export (Invoice, Credit)',
      requiredCount: 2,
      hint: 'Upload exactly 2 files: Invoice and Credit Excel files (any order).',
    },
    jio: {
      label: 'JioMart',
      requiredCount: 1,
      hint: 'Upload exactly 1 Jio CSV file.',
    },
    merge: {
      label: 'Generic Merge',
      minFiles: 2,
      hint: 'Upload 2 or more CSV/XLSX files to merge.',
    },
  };

  const loadExcelSheets = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/finance/amazon-missing-shipment/get-sheets', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.sheets || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading sheets:', error);
      return [];
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) =>
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
    const invalidFiles = files.filter(
      (file) => !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      if (invalidFiles.length > 0) {
        const invalidList = invalidFiles
          .map((f, idx) => `${idx + 1}. ${f.name} (${(f.size / 1024).toFixed(1)} KB)`)
          .join('\n');
        alert(
          `Error: Please select files with extensions ${allowedExtensions.join(
            ', '
          )}.\n\nInvalid Files Selected:\n${invalidList}`
        );
      } else {
        alert(`Error: Please select files with extensions ${allowedExtensions.join(', ')}.`);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // For missing shipment feature, validate file types
    if (isMissingShipment) {
      const csvFiles = validFiles.filter(f => f.name.toLowerCase().endsWith('.csv'));
      const excelFiles = validFiles.filter(f => 
        f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')
      );
      
      if (csvFiles.length !== 1 || excelFiles.length !== 1) {
        alert('Error: Please select exactly 1 CSV file (main_data) and 1 Excel file (country file).');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Load sheets from Excel file
      const sheets = await loadExcelSheets(excelFiles[0]);
      if (sheets.length > 0) {
        setAvailableSheets(sheets);
        setSelectedSheet(sheets[0]);
      }
    }

    const initialStatuses = validFiles.map((file) => ({
      fileName: file.name,
      status: 'pending',
      message: 'Waiting to process...',
    }));
    setFileStatuses(initialStatuses);
    setSelectedFiles(validFiles);
  };

  const handleFolderSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) =>
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      const allFiles = files.map((f, idx) => `${idx + 1}. ${f.name}`).join('\n');
      alert(
        `Error: No supported files found in the selected folder.\n\n` +
          `Supported extensions: ${allowedExtensions.join(', ')}\n\n` +
          `Files in Folder (${files.length}):\n${allFiles}`
      );
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
      return;
    }

    const initialStatuses = validFiles.map((file) => ({
      fileName: file.name,
      status: 'pending',
      message: 'Waiting to process...',
    }));
    setFileStatuses(initialStatuses);
    setSelectedFiles(validFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileStatuses(prev => prev.filter((_, i) => i !== index));
    
    // Clear sheets if removing Excel file for missing shipment feature
    if (isMissingShipment) {
      const removedFile = selectedFiles[index];
      const isExcel = removedFile?.name?.toLowerCase().endsWith('.xlsx') || 
                      removedFile?.name?.toLowerCase().endsWith('.xls');
      if (isExcel) {
        setAvailableSheets([]);
        setSelectedSheet('');
      }
    }
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      alert(`Error: Please select at least one file to process.`);
      return;
    }

    if (isGstFeature) {
      const requirement = MODE_REQUIREMENTS[mode] || MODE_REQUIREMENTS.amazon;
      if (requirement.requiredCount && selectedFiles.length !== requirement.requiredCount) {
        alert(
          `Please upload exactly ${requirement.requiredCount} file(s) for ${requirement.label}.`
        );
        return;
      }
      if (!requirement.requiredCount && requirement.minFiles && selectedFiles.length < requirement.minFiles) {
        alert(`Please upload at least ${requirement.minFiles} file(s) for ${requirement.label}.`);
        return;
      }
    }

    if (isMissingShipment) {
      if (selectedFiles.length !== 2) {
        alert('Please select exactly 2 files: 1 CSV file (main_data) and 1 Excel file (country file).');
        return;
      }
      if (!selectedSheet) {
        alert('Please select a sheet from the Excel file.');
        return;
      }
    }

    if (isMeir) {
      if (selectedFiles.length !== 7) {
        alert('Please select exactly 7 Excel files in this order:\n1. India Platform (Flipkart & Easy Ecomm)\n2. USA Platform (Walmart)\n3. 3G Warehouse Database\n4. Shipcube Inventory Database\n5. Updike Warehouse Database\n6. Amazon Inventory Database\n7. Container Data');
        return;
      }
      // Validate all files are Excel files
      const invalidFiles = selectedFiles.filter(file => {
        const fileName = file.name?.toLowerCase() || '';
        return !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls');
      });
      if (invalidFiles.length > 0) {
        alert('All MEIR files must be Excel files (.xlsx or .xls).');
        return;
      }
    }

    if (isBooksVsGst) {
      if (selectedFiles.length !== 2) {
        alert('Please select exactly 2 files: 1 GST Excel file (B2B) and 1 bookkeeping CSV/Excel file, in that order.');
        return;
      }

      const [gstFile, booksFile] = selectedFiles;
      const gstName = (gstFile.name || '').toLowerCase();
      const booksName = (booksFile.name || '').toLowerCase();

      const isGstExcel = gstName.endsWith('.xlsx') || gstName.endsWith('.xls');
      const isBooksValid =
        booksName.endsWith('.csv') ||
        booksName.endsWith('.xlsx') ||
        booksName.endsWith('.xls');

      if (!isGstExcel || !isBooksValid) {
        alert('Invalid files selected. Please upload:\n- 1 GST Excel file (.xlsx or .xls) exported from GST portal (B2B sheet)\n- 1 bookkeeping CSV/Excel file (.csv, .xlsx, .xls) exported from books.');
        return;
      }
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus(`Uploading ${selectedFiles.length} file(s)...`);
    
    // Initialize all files as uploading
    setFileStatuses(prev => prev.map(status => ({
      ...status,
      status: 'uploading',
      message: 'Uploading...'
    })));

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('feature', feature.id);
      if (isGstFeature) {
        formData.append('mode', mode);
      }
      if (isMissingShipment && selectedSheet) {
        formData.append('sheetName', selectedSheet);
      }

      // Update status to processing
      const fileTypeText = isGstFileProcessing || isMeir || isBookReconcile || isBooksVsGst ? 'Excel/CSV' : 'PDF';
      setProcessingStatus(`Processing ${selectedFiles.length} ${fileTypeText} file(s)...`);
      setFileStatuses(prev => prev.map(status => ({
        ...status,
        status: 'processing',
        message: 'Processing...'
      })));
      setProgress(10);

      const endpoint = apiEndpoint || '/api/finance/amazon-tax-invoice/process';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        const errorMessage = errorData.message || 'Processing failed';
        
        setIsProcessing(false);
        setProcessingStatus('');
        setProgress(0);
        
        // Update all files to error status
        setFileStatuses(prev => prev.map(status => ({
          ...status,
          status: 'error',
          message: 'Processing failed'
        })));
        
        const fileList = selectedFiles.map((f, idx) => `${idx + 1}. ${f.name}`).join('\n');
        let fileTypeCheck = '';
        if (isMeir) {
          fileTypeCheck = '- All 7 files are valid Excel files (.xlsx, .xls)\n- Files are in correct order (India Platform, USA Platform, 3G, Shipcube, Updike, Amazon, Container)';
        } else if (isGstFileProcessing) {
          fileTypeCheck = '- All files are valid Excel files (.xlsx, .xls)\n- Files contain GST data';
        } else if (isBooksVsGst) {
          fileTypeCheck = '- First file is a valid GST Excel file (.xlsx, .xls)\n- Second file is a valid bookkeeping CSV/Excel file (.csv, .xlsx, .xls)';
        } else {
          fileTypeCheck = '- All files are valid PDF files\n- Files contain Amazon tax invoice data';
        }
        alert(`Error: ${errorMessage}\n\nSelected Files:\n${fileList}\n\nPlease check:\n${fileTypeCheck}\n- Python and required packages are installed`);
        return;
      }

      // Simulate incremental progress as files are processed
      setProgress(30);
      const extractingText = isGstFileProcessing ? 'Extracting data from Excel files...' : 'Extracting data from PDFs...';
      setProcessingStatus(extractingText);
      
      // Update progress incrementally
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 500);

      setProcessingStatus('Generating Excel file...');
      setProgress(80);

      // Get the blob and download
      const blob = await response.blob();
      clearInterval(progressInterval);
      
      // Check if blob is actually an Excel file (not an error response)
      if (blob.size === 0) {
        setIsProcessing(false);
        setProcessingStatus('');
        setProgress(0);
        
        // Update all files to error status
        setFileStatuses(prev => prev.map(status => ({
          ...status,
          status: 'error',
          message: 'No data generated'
        })));
        
        const fileList = selectedFiles.map((f, idx) => `${idx + 1}. ${f.name}`).join('\n');
        alert(`Error: No data was generated. All files may have been excluded during processing.\n\nSelected Files:\n${fileList}\n\nPlease check:\n- Files contain valid Amazon tax invoice data\n- Invoice numbers and dates are present\n- Check the Processing_Summary sheet if it was created`);
        return;
      }

      setProgress(95);
      setProcessingStatus('Downloading Excel file...');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = feature.id === 'amazon-credit-note' 
        ? `amazon_credit_notes_${new Date().getTime()}.xlsx`
        : feature.id === 'gst-reconcile'
          ? `gst_${mode}_${new Date().getTime()}.csv`
          : feature.id === 'book-reconcile'
            ? `cleaned_book_keeping_${new Date().getTime()}.csv`
            : feature.id === 'books-vs-gst-reconciliation'
              ? `books_vs_gst_reconciliation_${new Date().getTime()}.csv`
              : `amazon_tax_invoices_${new Date().getTime()}.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);
      setProcessingStatus('Completed! File downloaded.');
      
      // Update all files to completed status
      setFileStatuses(prev => prev.map(status => ({
        ...status,
        status: 'completed',
        message: 'Processed successfully - File downloaded'
      })));
      
      setIsProcessing(false);
      toast.success(`Successfully processed ${selectedFiles.length} file(s)!`);
      
      // Don't close automatically - let user close manually
    } catch (error) {
      console.error('Processing error:', error);
      setIsProcessing(false);
      setProcessingStatus('');
      setProgress(0);
      
      // Update all files to error status
      setFileStatuses(prev => prev.map(status => ({
        ...status,
        status: 'error',
        message: 'Processing failed'
      })));
      
      let errorMessage = 'Failed to process files.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Could not connect to the server. Please check your connection and try again.';
      } else if (error.message.includes('Python')) {
        errorMessage = 'Python execution error: Make sure Python is installed and required packages (pandas, pdfplumber, openpyxl) are available.';
      }
      
      const fileList = selectedFiles.map((file, idx) => `${idx + 1}. ${file.name}`).join('\n');
      alert(`Error: ${errorMessage}\n\nSelected Files:\n${fileList}\n\nPlease try again or contact support if the issue persists.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Info */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className={`${feature.bgColor} rounded-full p-4 mb-4`}>
          <div className={feature.iconColor}>
            {feature.icon}
          </div>
        </div>
        <p className="text-lg font-medium text-neutral-700 text-center">
          {feature.title}
        </p>
        <p className="text-sm text-neutral-500 text-center mt-2">
          {feature.description}
        </p>
      </div>

      {/* Selection Buttons - In One Line */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptString}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-base font-semibold"
            icon={<File className="w-5 h-5" />}
          >
            Select File(s)
          </Button>
        </div>

        <div className="flex-1">
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="hidden"
          />
          <Button
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full bg-secondary-600 hover:bg-secondary-700 text-white py-3 text-base font-semibold"
            icon={<FolderOpen className="w-5 h-5" />}
          >
            Select Folder
          </Button>
        </div>
      </div>

      {(isGstFeature || isGstFileProcessing || isMissingShipment || isMeir || isBookReconcile || isBooksVsGst) && (
        <div className="space-y-2">
          {isGstFeature ? (
            <>
              <label className="text-sm font-semibold text-neutral-700">Select process</label>
              <select
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isProcessing}
              >
                {Object.entries(MODE_REQUIREMENTS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                {MODE_REQUIREMENTS[mode]?.hint || 'Upload the required files for the selected mode.'}
              </p>
            </>
          ) : isMissingShipment ? (
            <>
              {availableSheets.length > 0 && (
                <>
                  <label className="text-sm font-semibold text-neutral-700">Select Country Sheet</label>
                  <select
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    disabled={isProcessing}
                  >
                    {availableSheets.map((sheet) => (
                      <option key={sheet} value={sheet}>
                        {sheet}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500">
                    Select the country worksheet from the Excel file to compare with main_data.
                  </p>
                </>
              )}
              <p className="text-xs text-neutral-500">
                Upload 1 CSV file (main_data) and 1 Excel file (country file) to find missing shipments.
              </p>
            </>
          ) : isMeir ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-neutral-700">MEIR File Requirements</p>
              <p className="text-xs text-neutral-500">
                Upload exactly 7 Excel files in this order:
              </p>
              <ol className="text-xs text-neutral-500 list-decimal list-inside space-y-1 ml-2">
                <li>India Platform (with Flipkart & Easy Ecomm sheets)</li>
                <li>USA Platform (with Walmart_invntory sheet)</li>
                <li>3G Warehouse Database (with 3G-Inventory sheet)</li>
                <li>Shipcube Inventory Database (with Inventory_S-D sheet)</li>
                <li>Updike Warehouse Database (with Updk-Inveto sheet)</li>
                <li>Amazon Inventory Database (Overall Supply Chain Inventory)</li>
                <li>Container Data (with Container SKU sheet)</li>
              </ol>
            </div>
          ) : isBooksVsGst ? (
            <p className="text-xs text-neutral-500">
              Upload exactly 2 files: 1 GST Excel file (B2B sheet) and 1 bookkeeping CSV/Excel file (.csv, .xlsx, .xls) in that order.
            </p>
          ) : (
            <p className="text-xs text-neutral-500">
              Upload one or more GST Excel/CSV files; we will clean and merge them.
            </p>
          )}
        </div>
      )}

      {/* Process Button - Show before Selected Files */}
      {selectedFiles.length > 0 && !isProcessing && (
        <Button
          onClick={handleProcess}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
          icon={<Upload className="w-5 h-5" />}
        >
          Process {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
        </Button>
      )}

      {/* Processing Status with Incremental Progress */}
      {isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm font-medium">{processingStatus}</p>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-neutral-500">
            Progress: {progress}% - Please wait while we process your {isGstFileProcessing || isBookReconcile || isBooksVsGst ? 'Excel/CSV' : 'PDF'} files...
          </p>
        </div>
      )}

      {/* Selected Files List with Status */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">
            Selected Files ({selectedFiles.length}):
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-neutral-200 rounded-lg p-3">
            {selectedFiles.map((file, index) => {
              const fileStatus = fileStatuses[index] || { status: 'pending', message: 'Waiting...' };
              const statusColors = {
                pending: 'text-neutral-500',
                uploading: 'text-blue-600',
                processing: 'text-yellow-600',
                completed: 'text-green-600',
                error: 'text-red-600'
              };
              const statusIcons = {
                pending: <File className="w-4 h-4" />,
                uploading: <Loader2 className="w-4 h-4 animate-spin" />,
                processing: <Loader2 className="w-4 h-4 animate-spin" />,
                completed: <CheckCircle className="w-4 h-4" />,
                error: <AlertCircle className="w-4 h-4" />
              };
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-neutral-50 rounded p-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={statusColors[fileStatus.status] || 'text-neutral-500'}>
                      {statusIcons[fileStatus.status] || <File className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-neutral-700 truncate block">
                        {file.name}
                      </span>
                      <span className={`text-xs ${statusColors[fileStatus.status] || 'text-neutral-500'}`}>
                        {fileStatus.message}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Select one or more files, or select a folder (supported: {allowedExtensions.join(', ')})</li>
              {isGstFeature ? (
                <li>Choose the GST process mode and upload the required files.</li>
              ) : isGstFileProcessing ? (
                <li>Only Excel files (.xlsx, .xls) will be processed</li>
              ) : isBookReconcile ? (
                <li>Upload Book Keeping CSV/Excel files to clean and process</li>
              ) : isBooksVsGst ? (
                <li>Upload 1 GST Excel file (B2B) and 1 bookkeeping CSV/Excel file; we will reconcile them.</li>
              ) : (
                <li>Only PDF files will be processed</li>
              )}
              <li>The processed file will be downloaded automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileFolderSelector;

