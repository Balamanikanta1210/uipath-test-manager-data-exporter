import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, X, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseScopes, COMMON_TEST_MANAGER_SCOPES } from '@/utils/scopeParser';
import type { TestManagerCredentials } from '@/services/testManagerApi';
interface ConfigurationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (credentials: TestManagerCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
export function ConfigurationSidebar({
  isOpen,
  onClose,
  onAuthenticate,
  isLoading,
  error,
}: ConfigurationSidebarProps) {
  const [url, setUrl] = useState('https://cloud.uipath.com');
  const [organization, setOrganization] = useState('');
  const [tenant, setTenant] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [scopes, setScopes] = useState<string[]>(['OR.TestCases', 'OR.TestCases.Read']);
  const [scopeInput, setScopeInput] = useState('');
  const handleScopeInputChange = useCallback((value: string) => {
    setScopeInput(value);
  }, []);
  const handleScopeInputBlur = useCallback(() => {
    if (scopeInput.trim()) {
      const parsed = parseScopes(scopeInput);
      if (parsed.length > 0) {
        setScopes((prev) => {
          const combined = [...prev, ...parsed];
          return Array.from(new Set(combined));
        });
        setScopeInput('');
      }
    }
  }, [scopeInput]);
  const handleScopeInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        handleScopeInputBlur();
      }
    },
    [handleScopeInputBlur]
  );
  const handleAddScope = useCallback((scope: string) => {
    setScopes((prev) => {
      if (prev.includes(scope)) return prev;
      return [...prev, scope];
    });
  }, []);
  const handleRemoveScope = useCallback((scope: string) => {
    setScopes((prev) => prev.filter((s) => s !== scope));
  }, []);
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url || !organization || !tenant || !clientId || !clientSecret) {
        return;
      }
      if (scopes.length === 0) {
        return;
      }
      const credentials: TestManagerCredentials = {
        url,
        organization,
        tenant,
        clientId,
        clientSecret,
        scopes,
      };
      await onAuthenticate(credentials);
    },
    [url, organization, tenant, clientId, clientSecret, scopes, onAuthenticate]
  );
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-96 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">API Configuration</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-gray-700">
              API URL
            </Label>
            <Input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://cloud.uipath.com"
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
              Organization
            </Label>
            <Input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="your-org-name"
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant" className="text-sm font-medium text-gray-700">
              Tenant
            </Label>
            <Input
              id="tenant"
              type="text"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="DefaultTenant"
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-sm font-medium text-gray-700">
              Client ID
            </Label>
            <Input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="your-client-id"
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientSecret" className="text-sm font-medium text-gray-700">
              Client Secret
            </Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Scopes</Label>
            <div className="space-y-2">
              <Select onValueChange={handleAddScope}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select common scopes" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TEST_MANAGER_SCOPES.map((scope) => (
                    <SelectItem key={scope} value={scope} className="text-sm">
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                value={scopeInput}
                onChange={(e) => handleScopeInputChange(e.target.value)}
                onBlur={handleScopeInputBlur}
                onKeyDown={handleScopeInputKeyDown}
                placeholder="Or paste scope string (space/comma separated)"
                className="text-sm"
              />
            </div>
            {scopes.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                {scopes.map((scope) => (
                  <Badge
                    key={scope}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 px-2 py-1"
                  >
                    {scope}
                    <button
                      type="button"
                      onClick={() => handleRemoveScope(scope)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading || !url || !organization || !tenant || !clientId || !clientSecret || scopes.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Get Records'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}