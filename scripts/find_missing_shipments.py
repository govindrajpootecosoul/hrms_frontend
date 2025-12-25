#!/usr/bin/env python3
"""
Amazon Shipment Tracker - Missing Shipment ID Finder
====================================================
Compares Shipment IDs from main_data CSV with Reference No. from country-specific Excel worksheets
and identifies missing Shipment IDs.

Usage:
    python find_missing_shipments.py <main_data_csv> <country_excel> <sheet_name> [output_path]
"""

import pandas as pd
import os
import sys
from pathlib import Path
from datetime import datetime


def load_main_data(csv_path):
    """Load and prepare main_data from CSV with column renaming and date cleaning"""
    try:
        # Define required columns and column renaming (matching notebook)
        required_col = ['shipmentId', 'shipmentName', 'destinationFC', 'shipmentStatus', 'mskus',
                        'CREATING_date', 'RECEIVING_date', 'SHIPPED_date', 'CLOSED_date',
                        'merchantSKU',
                        'expectedQuantity_item', 'totalReceivedQuantity',
                        'totalDiscrepancyQuantity']
        
        col_rename = {'shipmentName': 'Shipment Name', 'shipmentId': 'Shipment ID', 
                      'destinationFC': 'Destination FC', 'shipmentStatus': 'Shipment Status', 
                      'mskus': 'Total SKUs',
                      'CREATING_date': 'Creating Date', 'RECEIVING_date': 'Receiving Date', 
                      'SHIPPED_date': 'Shipping Date', 'CLOSED_date': 'Closed Date',
                      'merchantSKU': 'SKU',
                      'expectedQuantity_item': 'Total Expected Quantity', 
                      'totalReceivedQuantity': 'Total Received Quantity',
                      'totalDiscrepancyQuantity': 'Total Discrepancy Quantity'}
        
        # Read CSV - try to use only required columns if they exist
        main_data = pd.read_csv(csv_path)
        
        # Check if 'Shipment ID' or 'shipmentId' column exists
        if 'Shipment ID' not in main_data.columns and 'shipmentId' not in main_data.columns:
            raise ValueError(f"Could not find 'Shipment ID' or 'shipmentId' column in main_data. Available columns: {', '.join(main_data.columns)}")
        
        # Select only required columns that exist in the CSV
        available_cols = [col for col in required_col if col in main_data.columns]
        if available_cols:
            main_data = main_data.loc[:, available_cols]
        
        # Rename columns
        rename_dict = {k: v for k, v in col_rename.items() if k in main_data.columns}
        main_data = main_data.rename(columns=rename_dict)
        
        # Clean date columns: strip whitespace and convert to %Y-%m-%d format
        date_columns = ['Creating Date', 'Receiving Date', 'Shipping Date', 'Closed Date']
        for col in date_columns:
            if col in main_data.columns:
                # Strip whitespace
                main_data[col] = main_data[col].astype(str).str.strip()
                
                # Replace empty strings, 'nan', 'None', 'NaT' with None
                mask_empty = main_data[col].isin(['', 'nan', 'None', 'NaT', 'NaN', 'None'])
                main_data.loc[mask_empty, col] = None
                
                # Convert to datetime - handle DD-MM-YYYY HH:MM:SS UTC format
                def parse_date(value):
                    if pd.isna(value) or value is None:
                        return None
                    
                    val_str = str(value).strip()
                    if val_str.lower() in ['', 'nan', 'none', 'nat', 'none']:
                        return None
                    
                    try:
                        # Parse with dayfirst=True to handle DD-MM-YYYY format
                        dt = pd.to_datetime(val_str, dayfirst=True, errors='coerce', utc=True)
                        if pd.notna(dt):
                            return dt.strftime('%Y-%m-%d')
                        return None
                    except Exception:
                        try:
                            dt = pd.to_datetime(val_str, dayfirst=True, errors='coerce')
                            if pd.notna(dt):
                                return dt.strftime('%Y-%m-%d')
                        except:
                            pass
                        return None
                
                # Apply date parsing
                main_data[col] = main_data[col].apply(parse_date)
        
        # Clean Shipment ID column - strip whitespace and remove empty values
        main_data['Shipment ID'] = main_data['Shipment ID'].astype(str).str.strip()
        main_data = main_data[main_data['Shipment ID'] != '']
        main_data = main_data[main_data['Shipment ID'] != 'nan']
        main_data = main_data[main_data['Shipment ID'].notna()]
        
        # Get unique Shipment IDs
        unique_shipments = set(main_data['Shipment ID'].unique())
        
        return main_data, unique_shipments
        
    except Exception as e:
        raise Exception(f"Error loading main_data: {e}")


def load_country_data(excel_path, sheet_name):
    """Load country-specific data from Excel worksheet"""
    try:
        # Read Excel sheet
        country_data = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        # Check if 'Reference No.' column exists (try variations)
        ref_col = None
        possible_cols = ['Reference No.', 'Reference No', 'ReferenceNo', 'reference_no', 'Reference_No', 'Shipment ID']
        
        for col in possible_cols:
            if col in country_data.columns:
                ref_col = col
                break
        
        if ref_col is None:
            raise ValueError(f"Could not find 'Reference No.' column in country data. Available columns: {', '.join(country_data.columns)}")
        
        # Clean Reference No. column - strip whitespace and remove empty values
        country_data[ref_col] = country_data[ref_col].astype(str).str.strip()
        country_data = country_data[country_data[ref_col] != '']
        country_data = country_data[country_data[ref_col] != 'nan']
        country_data = country_data[country_data[ref_col].notna()]
        
        # Get unique Reference Nos
        unique_refs = set(country_data[ref_col].unique())
        
        return country_data, unique_refs, ref_col
        
    except Exception as e:
        raise Exception(f"Error loading country data: {e}")


def find_missing_shipments(main_shipments, country_refs):
    """Find Shipment IDs that are in main_data but not in country file"""
    missing = main_shipments - country_refs
    return sorted(list(missing))


def create_output(missing_shipments, main_data, country_sheet, output_path):
    """Create output file with missing Shipment IDs and all required columns"""
    if not missing_shipments:
        return None
    
    # Create DataFrame with missing Shipment IDs and their details from main_data
    missing_df = main_data[main_data['Shipment ID'].isin(missing_shipments)].copy()
    
    # Include all columns from main_data
    output_columns = ['Shipment ID']
    for col in main_data.columns:
        if col != 'Shipment ID' and col not in output_columns:
            output_columns.append(col)
    
    # Select only columns that exist in missing_df
    available_output_cols = [col for col in output_columns if col in missing_df.columns]
    missing_df = missing_df[available_output_cols]
    
    # Sort by Shipment ID and SKU
    sort_cols = ['Shipment ID']
    if 'SKU' in missing_df.columns:
        sort_cols.append('SKU')
    missing_df = missing_df.sort_values(sort_cols)
    
    # Write to Excel
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        missing_df.to_excel(writer, sheet_name='Missing Shipments', index=False)
        
        # Create summary sheet
        summary_data = {
            'Metric': ['Total Missing Shipment IDs (Unique)', 'Total Rows (All SKUs)', 'Country Sheet', 'Generated On'],
            'Value': [len(missing_shipments), len(missing_df), country_sheet, datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        }
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
    
    return output_path


def main():
    """Main function - accepts command line arguments"""
    if len(sys.argv) < 4:
        print("Usage: python find_missing_shipments.py <main_data_csv> <country_excel> <sheet_name> [output_path]")
        sys.exit(1)
    
    main_data_path = sys.argv[1]
    country_file_path = sys.argv[2]
    sheet_name = sys.argv[3]
    output_path = sys.argv[4] if len(sys.argv) > 4 else None
    
    try:
        # Load main_data
        main_data, main_shipments = load_main_data(main_data_path)
        
        # Load country data
        country_data, country_refs, ref_col = load_country_data(country_file_path, sheet_name)
        
        # Find missing shipments
        missing_shipments = find_missing_shipments(main_shipments, country_refs)
        
        if not missing_shipments:
            print("No missing Shipment IDs found!")
            sys.exit(0)
        
        # Generate output filename if not provided
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"missing_shipments_{sheet_name}_{timestamp}.xlsx"
        
        # Ensure .xlsx extension
        output_path = Path(output_path)
        if output_path.suffix.lower() != '.xlsx':
            output_path = output_path.with_suffix('.xlsx')
        
        # Create output
        result_path = create_output(missing_shipments, main_data, sheet_name, str(output_path))
        
        if result_path:
            print(f"SUCCESS: Output file created: {result_path}")
            print(f"Missing Shipment IDs: {len(missing_shipments)}")
            sys.exit(0)
        else:
            print("No missing shipments found.")
            sys.exit(0)
            
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

