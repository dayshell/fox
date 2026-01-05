import {
  FoxPaysCurrency,
  FoxPaysPaymentGateway,
  FoxPaysH2HOrder,
  CreateFoxPaysOrderParams,
  FoxPaysApiResponse,
} from '@/types/foxpays';

export class FoxPaysClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Access-Token': this.accessToken,
    };

    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    console.log('[FoxPays Request]', method, url, body ? JSON.stringify(body) : '');

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    console.log('[FoxPays Response]', response.status, text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Response is not JSON - likely a PHP error
      throw new Error(`FoxPays вернул некорректный ответ: ${text.substring(0, 200)}`);
    }

    if (!response.ok || data.success === false) {
      const errorMessage = data.message || 'FoxPays API Error';
      const error = new Error(errorMessage) as Error & { 
        code?: number; 
        errors?: Record<string, string[]>;
      };
      error.code = response.status;
      error.errors = data.errors;
      throw error;
    }

    return data.data;
  }

  async getCurrencies(): Promise<FoxPaysCurrency[]> {
    return this.request<FoxPaysCurrency[]>('GET', '/api/currencies');
  }

  async getPaymentGateways(): Promise<FoxPaysPaymentGateway[]> {
    return this.request<FoxPaysPaymentGateway[]>('GET', '/api/payment-gateways');
  }

  async createH2HOrder(params: CreateFoxPaysOrderParams): Promise<FoxPaysH2HOrder> {
    return this.request<FoxPaysH2HOrder>('POST', '/api/h2h/order', params);
  }

  async getH2HOrder(orderId: string): Promise<FoxPaysH2HOrder> {
    return this.request<FoxPaysH2HOrder>('GET', `/api/h2h/order/${orderId}`);
  }

  async confirmPayment(orderId: string): Promise<void> {
    await this.request<void>('PATCH', `/api/h2h/order/${orderId}/confirm-client`);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.request<void>('PATCH', `/api/h2h/order/${orderId}/cancel`);
  }

  async uploadReceipt(orderId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(
      `${this.baseUrl}/api/h2h/order/${orderId}/receipt`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Access-Token': this.accessToken,
        },
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Failed to upload receipt');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrencies();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance getter
let clientInstance: FoxPaysClient | null = null;

export function getFoxPaysClient(baseUrl: string, accessToken: string): FoxPaysClient {
  if (!clientInstance || 
      clientInstance['baseUrl'] !== baseUrl || 
      clientInstance['accessToken'] !== accessToken) {
    clientInstance = new FoxPaysClient(baseUrl, accessToken);
  }
  return clientInstance;
}

export function clearFoxPaysClient(): void {
  clientInstance = null;
}
