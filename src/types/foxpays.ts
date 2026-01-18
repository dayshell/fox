// FoxPays API Types

export type FoxPaysDetailType = 'card' | 'phone' | 'account_number' | 'qrcode';

export type FoxPaysOrderStatus = 'pending' | 'success' | 'fail';

export type FoxPaysSubStatus = 
  | 'accepted'
  | 'successfully_paid'
  | 'successfully_paid_by_resolved_dispute'
  | 'waiting_details_to_be_selected'
  | 'waiting_for_payment'
  | 'waiting_for_dispute_to_be_resolved'
  | 'canceled_by_dispute'
  | 'expired'
  | 'cancelled';

export interface FoxPaysCurrency {
  currency: string;
  precision: number;
  symbol: string;
  name: string;
}

export interface FoxPaysPaymentGateway {
  name: string;
  code: string;
  schema: string;
  currency: string;
  min_limit: string;
  max_limit: string;
  reservation_time: number;
  detail_types: FoxPaysDetailType[];
  is_active?: boolean;
}

export interface FoxPaysPaymentDetail {
  detail: string;
  detail_type: FoxPaysDetailType;
  initials: string;
  qr_code_url?: string;
  qr_code_link?: string;
}

export interface FoxPaysH2HOrder {
  order_id: string;
  external_id: string;
  merchant_id: string;
  base_amount: string;
  amount: string;
  profit: string;
  merchant_profit: string;
  currency: string;
  profit_currency: string;
  conversion_price_currency: string;
  conversion_price: string;
  status: FoxPaysOrderStatus;
  sub_status: FoxPaysSubStatus;
  callback_url: string | null;
  payment_gateway: string;
  payment_gateway_schema: string;
  payment_gateway_name: string;
  payment_detail: FoxPaysPaymentDetail | null;
  merchant: {
    name: string;
    description: string;
  };
  finished_at: number | null;
  expires_at: number;
  created_at: number;
  current_server_time: number;
}

export interface CreateFoxPaysOrderParams {
  external_id: string;
  amount: number;
  merchant_id: string;
  payment_gateway?: string;
  currency?: string;
  payment_detail_type?: FoxPaysDetailType;
  callback_url?: string;
  is_transgran?: '0' | '1';
}

export interface FoxPaysApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FoxPaysApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Firebase stored types
export interface FoxPaysConfig {
  id: string;
  apiBaseUrl: string;
  accessToken: string;
  isEnabled: boolean;
  updatedAt: Date;
}

export interface ExchangeOrder {
  id: string;
  foxpaysOrderId: string;
  externalId: string;
  baseAmount: number;
  amount: number;
  currency: string;
  paymentGateway: string;
  paymentGatewayName: string;
  paymentDetail: {
    detail: string;
    detailType: FoxPaysDetailType;
    initials: string;
    qrCodeUrl?: string;
  };
  status: FoxPaysOrderStatus;
  subStatus: FoxPaysSubStatus;
  coinId: string;
  coinSymbol: string;
  coinAmount: number;
  userContact: string;
  expiresAt: number;
  finishedAt: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Status display maps
export const ORDER_STATUS_MAP: Record<FoxPaysOrderStatus, string> = {
  pending: 'Ожидание',
  success: 'Успешно',
  fail: 'Ошибка',
};

export const ORDER_SUB_STATUS_MAP: Record<FoxPaysSubStatus, string> = {
  accepted: 'Закрыт вручную',
  successfully_paid: 'Оплачен',
  successfully_paid_by_resolved_dispute: 'Оплачен после спора',
  waiting_details_to_be_selected: 'Ожидание реквизитов',
  waiting_for_payment: 'Ожидание оплаты',
  waiting_for_dispute_to_be_resolved: 'Спор на рассмотрении',
  canceled_by_dispute: 'Отменен по спору',
  expired: 'Истекло время',
  cancelled: 'Отменен',
};
