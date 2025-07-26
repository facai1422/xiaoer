
export interface PaymentChannel {
  id: string;
  name: string;
  code: string;
  exchange_rate: number;
  fee_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ChannelOrder {
  id: string;
  order_no: string;
  channel_id: string;
  user_id: string;
  amount: number;
  usdt_amount: number;
  status: OrderStatus;
  note?: string;
  created_at: string;
  updated_at: string;
  payment_channels?: PaymentChannel;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  note?: string;
  created_by: string;
  created_at: string;
}

export interface OrderStats {
  status: string;
  count: number;
  sum: {
    amount: number;
    usdt_amount: number;
  };
}
