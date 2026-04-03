import React from 'react';
import { List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
interface TableToolbarProps {
  selectedCount: number;
  totalCount: number;
  viewMode: 'standard' | 'grouped';
  onViewModeChange: (mode: 'standard' | 'grouped') => void;
}
export function TableToolbar({
  selectedCount,
  totalCount,
  viewMode,
  onViewModeChange,
}: TableToolbarProps) {
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