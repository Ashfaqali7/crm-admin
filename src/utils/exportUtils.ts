// Utility functions for exporting data in various formats
import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  title: string;
  render?: (value: any, record: any) => string;
}

export const exportToCSV = (data: any[], columns: ExportColumn[], filename: string) => {
  // Create CSV header
  const headers = columns.map(col => `"${col.title}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(record => {
    return columns.map(col => {
      const value = col.render ? col.render(record[col.key], record) : record[col.key];
      // Escape quotes and wrap in quotes
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// For Excel export, we would typically use a library like xlsx
// This is a simplified version - in a real implementation, you'd use a proper library
export const exportToExcel = (data: any[], columns: ExportColumn[], filename: string) => {
  // Prepare data for Excel
  const excelData = data.map(record => {
    const row: any = {};
    columns.forEach(col => {
      const value = col.render ? col.render(record[col.key], record) : record[col.key];
      row[col.title] = value;
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Export to file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};