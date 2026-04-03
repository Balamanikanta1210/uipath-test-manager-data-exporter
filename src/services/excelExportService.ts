import ExcelJS from 'exceljs';
import type { TestCase, TestSteps } from './testManagerApi';
export interface ExcelExportOptions {
  testCases: TestCase[];
  filename?: string;
}
function formatTestSteps(testSteps?: TestSteps): string {
  if (!testSteps) return '';
  const lines: string[] = [];
  // Precondition
  if (testSteps.precondition && testSteps.precondition.trim()) {
    lines.push('Precondition:');
    lines.push(`  ${testSteps.precondition}`);
    lines.push('');
  }
  // Steps
  if (testSteps.steps && testSteps.steps.length > 0) {
    lines.push('Steps:');
    testSteps.steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.description || ''}`);
      if (step.expectedBehavior) {
        lines.push(`   Expected: ${step.expectedBehavior}`);
      }
      if (step.clipboardData) {
        lines.push(`   Data: ${step.clipboardData}`);
      }
    });
    lines.push('');
  }
  // Postcondition
  if (testSteps.postcondition && testSteps.postcondition.trim()) {
    lines.push('Postcondition:');
    lines.push(`  ${testSteps.postcondition}`);
  }
  return lines.join('\n').trim();
}
function getAllCustomFieldKeys(testCases: TestCase[]): string[] {
  const keys = new Set<string>();
  testCases.forEach((tc) => {
    if (tc.customFields) {
      Object.keys(tc.customFields).forEach((key) => keys.add(key));
    }
  });
  return Array.from(keys).sort();
}
function formatColumnName(column: string): string {
  return column
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
function getCellValue(testCase: TestCase, column: string): string | number {
  if (column === 'id') return testCase.id;
  if (column === 'name') return testCase.name || '';
  if (column === 'description') return testCase.description || '';
  if (column === 'labels') return testCase.labels?.join(', ') || '';
  if (column === 'testSteps') return formatTestSteps(testCase.testSteps);
  if (testCase.customFields && testCase.customFields[column] !== undefined) {
    const val = testCase.customFields[column];
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') return val;
    return String(val);
  }
  return '';
}
const MAX_CELL_LENGTH = 32767;
function truncateIfNeeded(text: string): string {
  if (text.length <= MAX_CELL_LENGTH) return text;
  return text.substring(0, MAX_CELL_LENGTH - 50) + '\n\n[Content truncated due to Excel cell limit]';
}
export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  const { testCases, filename } = options;
  if (testCases.length === 0) {
    throw new Error('No test cases to export');
  }
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'UiPath Test Manager Exporter';
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet('Test Cases', {
    properties: { defaultRowHeight: 15 },
  });
  // Build column list
  const baseColumns = ['id', 'name', 'description', 'labels'];
  const customFieldKeys = getAllCustomFieldKeys(testCases);
  const columns = [...baseColumns, ...customFieldKeys, 'testSteps'];
  // Add header row
  const headerRow = worksheet.addRow(columns.map(formatColumnName));
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 20;
  // Add data rows
  testCases.forEach((testCase) => {
    const rowData = columns.map((col) => {
      const value = getCellValue(testCase, col);
      if (col === 'testSteps' && typeof value === 'string') {
        return truncateIfNeeded(value);
      }
      return value;
    });
    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  });
  // Set column widths
  columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    if (col === 'id') {
      column.width = 10;
    } else if (col === 'name') {
      column.width = 30;
    } else if (col === 'description') {
      column.width = 40;
    } else if (col === 'testSteps') {
      column.width = 60;
    } else if (col === 'labels') {
      column.width = 25;
    } else {
      column.width = 20;
    }
  });
  // Apply borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });
  });
  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalFilename = filename || `TestCases_Export_${timestamp}.xlsx`;
  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}