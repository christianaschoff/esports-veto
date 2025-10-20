export class VetoApiService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  public readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    const response = await fetch(`${this.baseUrl}/token`);
    if (!response.ok) throw new Error('Failed to get token');

    const tokenWithQuotes = await response.text();
    this.token = tokenWithQuotes.replace(/"/g, ''); // Remove quotes
    this.tokenExpiry = new Date(Date.now() + 25 * 60 * 1000); // 25 min expiry
    return this.token;
  }

  async createVeto(vetoData: any): Promise<any> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vetoData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }
}