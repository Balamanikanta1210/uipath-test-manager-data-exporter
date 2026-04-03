export interface TestManagerCredentials {
  url: string;
  organization: string;
  tenant: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}
export interface TestManagerAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
export interface TestStep {
  description: string;
  expectedBehavior?: string;
  clipboardData?: string;
}
export interface TestSteps {
  precondition?: string;
  steps: TestStep[];
  postcondition?: string;
}
export interface TestCase {
  id: number;
  name: string;
  description?: string;
  labels?: string[];
  customFields?: Record<string, any>;
  testSteps?: TestSteps;
  [key: string]: any;
}
export class TestManagerApiService {
  private baseUrl: string;
  private organization: string;
  private tenant: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  constructor() {
    this.baseUrl = '';
    this.organization = '';
    this.tenant = '';
  }
  async authenticate(credentials: TestManagerCredentials): Promise<void> {
    this.baseUrl = credentials.url.replace(/\/$/, '');
    this.organization = credentials.organization;
    this.tenant = credentials.tenant;
    const tokenUrl = `${this.baseUrl}/identity_/connect/token`;
    const scope = credentials.scopes.join(' ');
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      scope: scope,
    });
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} ${errorText}`);
      }
      const data: TestManagerAuthResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiry = null;
      throw new Error(
        error instanceof Error
          ? `Failed to authenticate: ${error.message}`
          : 'Authentication failed with unknown error'
      );
    }
  }
  isAuthenticated(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiry !== null &&
      Date.now() < this.tokenExpiry
    );
  }
  getAccessToken(): string | null {
    return this.isAuthenticated() ? this.accessToken : null;
  }
  async fetchTestCases(): Promise<TestCase[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate first.');
    }
    const apiUrl = `${this.baseUrl}/${this.organization}/${this.tenant}/orchestrator_/testmanager/api/testcases`;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch test cases: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.value || [];
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch test cases'
      );
    }
  }
  clearAuth(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.baseUrl = '';
    this.organization = '';
    this.tenant = '';
  }
}
export const testManagerApi = new TestManagerApiService();