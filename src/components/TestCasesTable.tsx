import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import type { TestCase } from '@/services/testManagerApi';
type SortDirection = 'asc' | 'desc' | null;
interface ColumnFilter {
  [key: string]: string;
}
interface TestCasesTableProps {
  testCases: TestCase[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}
export function TestCasesTable({
  testCases,
  selectedIds,
  onSelectionChange,
}: TestCasesTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<ColumnFilter>({});
  // Extract all unique column keys from test cases
  const columns = useMemo(() => {
    const baseColumns = ['id', 'name', 'description'];
    const customFieldKeys = new Set<string>();
    testCases.forEach((tc) => {
      if (tc.customFields) {
        Object.keys(tc.customFields).forEach((key) => customFieldKeys.add(key));
      }
      if (tc.labels && tc.labels.length > 0) {
        customFieldKeys.add('labels');
      }
    });
    return [...baseColumns, ...Array.from(customFieldKeys)];
  }, [testCases]);
  // Handle column sort
  const handleSort = useCallback((column: string) => {
    setSortColumn((prevColumn) => {
      setSortDirection((prevDirection) => {
        if (prevColumn === column) {
          if (prevDirection === 'asc') {
            return 'desc';
          } else if (prevDirection === 'desc') {
            setSortColumn(null);
            return null;
          } else {
            return 'asc';
          }
        } else {
          return 'asc';
        }
      });
      return prevColumn === column && sortDirection === 'desc' ? null : column;
    });
  }, [sortDirection]);
  // Handle filter change
  const handleFilterChange = useCallback((column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);
  // Get cell value for sorting and filtering
  const getCellValue = useCallback((testCase: TestCase, column: string): string => {
    if (column === 'id') return String(testCase.id);
    if (column === 'name') return testCase.name || '';
    if (column === 'description') return testCase.description || '';
    if (column === 'labels') return testCase.labels?.join(', ') || '';
    if (testCase.customFields && testCase.customFields[column] !== undefined) {
      const val = testCase.customFields[column];
      return val === null || val === undefined ? '' : String(val);
    }
    return '';
  }, []);
  // Filter and sort test cases
  const filteredAndSortedTestCases = useMemo(() => {
    let result = [...testCases];
    // Apply filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue.trim()) {
        result = result.filter((tc) => {
          const cellValue = getCellValue(tc, column).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });
    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = getCellValue(a, sortColumn);
        const bVal = getCellValue(b, sortColumn);
        // Try numeric comparison first
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        // Fall back to string comparison
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [testCases, filters, sortColumn, sortDirection, getCellValue]);
  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredAndSortedTestCases.length && filteredAndSortedTestCases.length > 0) {
      onSelectionChange(new Set());
    } else {
      const allIds = new Set(filteredAndSortedTestCases.map((tc) => tc.id));
      onSelectionChange(allIds);
    }
  }, [selectedIds.size, filteredAndSortedTestCases, onSelectionChange]);
  // Handle individual row selection
  const handleRowSelect = useCallback(
    (id: number) => {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange]
  );
  // Format column name for display
  const formatColumnName = (column: string): string => {
    return column
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };
  const allSelected =
    filteredAndSortedTestCases.length > 0 &&
    selectedIds.size === filteredAndSortedTestCases.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 px-3 py-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column} className="px-3 py-2">
                  <button
                    onClick={() => handleSort(column)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    {formatColumnName(column)}
                    {sortColumn === column ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-gray-400" />
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-gray-50 border-t border-gray-200">
              <TableHead className="px-3 py-2" />
              {columns.map((column) => (
                <TableHead key={`filter-${column}`} className="px-3 py-2">
                  <Input
                    type="text"
                    placeholder="Filter..."
                    value={filters[column] || ''}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    className="h-7 text-xs"
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTestCases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-sm text-gray-500"
                >
                  No test cases match the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTestCases.map((testCase, index) => (
                <TableRow
                  key={testCase.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <TableCell className="px-3 py-2">
                    <Checkbox
                      checked={selectedIds.has(testCase.id)}
                      onCheckedChange={() => handleRowSelect(testCase.id)}
                      aria-label={`Select test case ${testCase.id}`}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column} className="px-3 py-2 text-sm text-gray-700">
                      {getCellValue(testCase, column) || '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}