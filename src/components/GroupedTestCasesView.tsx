import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
interface GroupedTestCasesViewProps {
  testCases: TestCase[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}
interface TestCaseGroup {
  label: string;
  testCases: TestCase[];
}
export function GroupedTestCasesView({
  testCases,
  selectedIds,
  onSelectionChange,
}: GroupedTestCasesViewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<ColumnFilter>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Extract all unique column keys from test cases
  const columns = useMemo(() => {
    const baseColumns = ['id', 'name', 'description'];
    const customFieldKeys = new Set<string>();
    testCases.forEach((tc) => {
      if (tc.customFields) {
        Object.keys(tc.customFields).forEach((key) => customFieldKeys.add(key));
      }
    });
    return [...baseColumns, ...Array.from(customFieldKeys)];
  }, [testCases]);
  // Get cell value for sorting and filtering
  const getCellValue = useCallback((testCase: TestCase, column: string): string => {
    if (column === 'id') return String(testCase.id);
    if (column === 'name') return testCase.name || '';
    if (column === 'description') return testCase.description || '';
    if (testCase.customFields && testCase.customFields[column] !== undefined) {
      const val = testCase.customFields[column];
      return val === null || val === undefined ? '' : String(val);
    }
    return '';
  }, []);
  // Filter test cases
  const filteredTestCases = useMemo(() => {
    let result = [...testCases];
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue.trim()) {
        result = result.filter((tc) => {
          const cellValue = getCellValue(tc, column).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });
    return result;
  }, [testCases, filters, getCellValue]);
  // Group test cases by labels
  const groupedTestCases = useMemo(() => {
    const groups: TestCaseGroup[] = [];
    const labelMap = new Map<string, TestCase[]>();
    const noLabelCases: TestCase[] = [];
    filteredTestCases.forEach((tc) => {
      if (!tc.labels || tc.labels.length === 0) {
        noLabelCases.push(tc);
      } else {
        // Use primary label (first label) for grouping
        const primaryLabel = tc.labels[0];
        if (!labelMap.has(primaryLabel)) {
          labelMap.set(primaryLabel, []);
        }
        labelMap.get(primaryLabel)!.push(tc);
      }
    });
    // Sort groups alphabetically by label
    const sortedLabels = Array.from(labelMap.keys()).sort((a, b) => a.localeCompare(b));
    sortedLabels.forEach((label) => {
      groups.push({ label, testCases: labelMap.get(label)! });
    });
    // Add unlabeled group at the end if it has items
    if (noLabelCases.length > 0) {
      groups.push({ label: 'Unlabeled', testCases: noLabelCases });
    }
    return groups;
  }, [filteredTestCases]);
  // Apply sorting within each group
  const sortedGroups = useMemo(() => {
    if (!sortColumn || !sortDirection) return groupedTestCases;
    return groupedTestCases.map((group) => ({
      ...group,
      testCases: [...group.testCases].sort((a, b) => {
        const aVal = getCellValue(a, sortColumn);
        const bVal = getCellValue(b, sortColumn);
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }),
    }));
  }, [groupedTestCases, sortColumn, sortDirection, getCellValue]);
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
  // Toggle group expansion
  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);
  // Handle group select all
  const handleGroupSelectAll = useCallback(
    (group: TestCaseGroup) => {
      const groupIds = group.testCases.map((tc) => tc.id);
      const allSelected = groupIds.every((id) => selectedIds.has(id));
      const newSelection = new Set(selectedIds);
      if (allSelected) {
        groupIds.forEach((id) => newSelection.delete(id));
      } else {
        groupIds.forEach((id) => newSelection.add(id));
      }
      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange]
  );
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
  // Expand all groups by default on mount
  React.useEffect(() => {
    const allLabels = sortedGroups.map((g) => g.label);
    setExpandedGroups(new Set(allLabels));
  }, [sortedGroups]);
  if (sortedGroups.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="text-center py-8 text-sm text-gray-500">
          No test cases match the current filters
        </div>
      </div>
    );
  }
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 px-3 py-2" />
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
            {sortedGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.label);
              const groupIds = group.testCases.map((tc) => tc.id);
              const allSelected = groupIds.every((id) => selectedIds.has(id));
              const someSelected = groupIds.some((id) => selectedIds.has(id)) && !allSelected;
              return (
                <React.Fragment key={group.label}>
                  <TableRow className="bg-gray-100 hover:bg-gray-150">
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleGroup(group.label)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="size-4 text-gray-600" />
                          )}
                        </button>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => handleGroupSelectAll(group)}
                          aria-label={`Select all in ${group.label}`}
                          className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      colSpan={columns.length}
                      className="px-3 py-2 text-sm font-semibold text-gray-900"
                    >
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                      >
                        {group.label}
                        <span className="text-xs font-normal text-gray-500">
                          ({group.testCases.length} test case{group.testCases.length !== 1 ? 's' : ''})
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    group.testCases.map((testCase, index) => (
                      <TableRow
                        key={testCase.id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <TableCell className="px-3 py-2 pl-12">
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
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}