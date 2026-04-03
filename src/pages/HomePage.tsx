import React, { useState, useCallback } from 'react';
import { Settings, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigurationSidebar } from '@/components/ConfigurationSidebar';
import { TestCasesTable } from '@/components/TestCasesTable';
import { GroupedTestCasesView } from '@/components/GroupedTestCasesView';
import { TableToolbar } from '@/components/TableToolbar';
import { testManagerApi } from '@/services/testManagerApi';
import type { TestManagerCredentials, TestCase } from '@/services/testManagerApi';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'standard' | 'grouped'>('standard');
  const handleAuthenticate = useCallback(async (credentials: TestManagerCredentials) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await testManagerApi.authenticate(credentials);
      setIsAuthenticated(true);
      toast.success('Authentication successful', {
        description: 'Fetching test cases...',
      });
      setIsFetchingData(true);
      const data = await testManagerApi.fetchTestCases();
      setTestCases(data);
      setIsFetchingData(false);
      setIsSidebarOpen(false);
      toast.success('Test cases loaded', {
        description: `Retrieved ${data.length} test case${data.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthError(errorMessage);
      setIsAuthenticated(false);
      setIsFetchingData(false);
      toast.error('Authentication failed', {
        description: errorMessage,
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);
  const handleDisconnect = useCallback(() => {
    testManagerApi.clearAuth();
    setIsAuthenticated(false);
    setTestCases([]);
    setSelectedIds(new Set());
    setAuthError(null);
    setIsSidebarOpen(true);
    toast.info('Disconnected', {
      description: 'Authentication cleared',
    });
  }, []);
  const handleSelectionChange = useCallback((ids: Set<number>) => {
    setSelectedIds(ids);
  }, []);
  const handleViewModeChange = useCallback((mode: 'standard' | 'grouped') => {
    setViewMode(mode);
    toast.success(`Switched to ${mode} view`, {
      description: mode === 'grouped' ? 'Test cases grouped by labels' : 'Flat list view',
    });
  }, []);
  return (
    <AppLayout className="bg-gray-50">
      <div className="min-h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">UiPath Test Manager Exporter</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  <CheckCircle2 className="size-4" />
                  <span>Connected</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-sm"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">
                <XCircle className="size-4" />
                <span>Not Connected</span>
              </div>
            )}
          </div>
        </div>
        <ConfigurationSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAuthenticate={handleAuthenticate}
          isLoading={isAuthenticating}
          error={authError}
        />
        <div
          className="flex-1"
          style={{
            marginLeft: isSidebarOpen ? '384px' : '0',
            transition: 'margin-left 0.2s ease-in-out',
          }}
        >
          {isFetchingData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Loading test cases...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-100 rounded-lg mb-4">
                  <Settings className="size-8 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Configure API Connection</h2>
                <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
                  Open the configuration panel to enter your UiPath Test Manager API credentials
                </p>
                <Button
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Open Configuration
                </Button>
              </div>
            </div>
          ) : testCases.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-100 rounded-lg mb-4">
                  <XCircle className="size-8 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">No Test Cases Found</h2>
                <p className="text-sm text-gray-600">No test cases were retrieved from the API</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <TableToolbar
                  selectedCount={selectedIds.size}
                  totalCount={testCases.length}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
                {viewMode === 'standard' ? (
                  <TestCasesTable
                    testCases={testCases}
                    selectedIds={selectedIds}
                    onSelectionChange={handleSelectionChange}
                  />
                ) : (
                  <GroupedTestCasesView
                    testCases={testCases}
                    selectedIds={selectedIds}
                    onSelectionChange={handleSelectionChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <Toaster richColors closeButton position="top-right" />
      </div>
    </AppLayout>
  );
}