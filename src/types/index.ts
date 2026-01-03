export interface Coin {
  id: string;
  name: string;
  symbol: string;
  logoUrl: string;
  network?: string; // e.g., 'TRC20', 'ERC20', 'BEP20'
  buyRate: number;
  sellRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDetails {
  id: string;
  type: 'bank' | 'crypto';
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
  coinId?: string;
  walletAddress?: string;
  network?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: Date;
  isPublished: boolean;
  createdAt: Date;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export type Language = 'ru' | 'en' | 'uz';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  fromCoinId: string;
  fromCoinSymbol: string;
  fromCoinName: string;
  toCoinId: string;
  toCoinSymbol: string;
  toCoinName: string;
  amount: number;
  receiveAmount: number;
  rate: number;
  customerWallet: string;
  status: OrderStatus;
  adminMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
