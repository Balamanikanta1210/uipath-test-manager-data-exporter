import React, { useState, useCallback } from 'react';
import { List, Grid, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportToExcel } from '@/services/excelExportService';
import type { TestCase } from '@/services/testManagerApi';
import { toast } from '@/components/ui/sonner';
interface TableToolbarProps {
  selectedCount: number;
  totalCount: number;
  viewMode: 'standard' | 'grouped';
  onViewModeChange: (mode: 'standard' | 'grouped') => void;
  testCases: TestCase[];
  selectedIds: Set<number>;
}
export function TableToolbar({
  selectedCount,
  totalCount,
  viewMode,
  onViewModeChange,
  testCases,
  selectedIds,
}: TableToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = useCallback(async () => {
    if (selectedIds.size === 0) {
      toast.error('No test cases selected', {
        description: 'Please select at least one test case to export',
      });
      return;
    }
    setIsExporting(true);
    try {
      const selectedTestCases = testCases.filter((tc) => selectedIds.has(tc.id));
      await exportToExcel({ testCases: selectedTestCases });
      toast.success('Export successful', {
        description: `Exported ${selectedTestCases.length} test case${selectedTestCases.length !== 1 ? 's' : ''} to Excel`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast.error('Export failed', {
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  }, [testCases, selectedIds]);
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{totalCount}</span> test case{totalCount !== 1 ? 's' : ''}
        </div>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selected
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExport}
          disabled={selectedCount === 0 || isExporting}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5"
          size="sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="size-4 mr-1.5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="size-4 mr-1.5" />
              Export
            </>
          )}
        </Button>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('standard')}
            className={`rounded-none px-3 py-1.5 text-xs ${
              viewMode === 'standard'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="size-4 mr-1.5" />
            Standard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grouped')}
            className={`rounded-none px-3 py-1.5 text-xs border-l border-gray-200 ${
              viewMode === 'grouped'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="size-4 mr-1.5" />
            Grouped
          </Button>
        </div>
      </div>
    </div>
  );
}