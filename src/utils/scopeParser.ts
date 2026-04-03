export const COMMON_TEST_MANAGER_SCOPES = [
  'OR.TestSets',
  'OR.TestSets.Read',
  'OR.TestSetExecutions',
  'OR.TestSetExecutions.Read',
  'OR.TestCases',
  'OR.TestCases.Read',
  'OR.TestCaseExecutions',
  'OR.TestCaseExecutions.Read',
  'OR.Folders',
  'OR.Folders.Read',
];
export function parseScopes(input: string): string[] {
  if (!input || !input.trim()) {
    return [];
  }
  const delimiters = /[\s,;]+/;
  const scopes = input
    .split(delimiters)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const uniqueScopes = Array.from(new Set(scopes));
  return uniqueScopes;
}
export function validateScope(scope: string): boolean {
  return scope.length > 0 && /^[A-Za-z0-9._-]+$/.test(scope);
}
export function formatScopesForDisplay(scopes: string[]): string {
  return scopes.join(' ');
}