// User profile type definition
export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  username?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  invite_code?: string;
  referrer_id?: string;
  agent_level?: number;
  commission_rate?: number;
  balance: number;
  frozen_balance?: number;
  total_recharge?: number;
  total_withdraw?: number;
  total_commission?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  referral_count?: number;
}

// System setting type definition
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Order type definition
export interface Order {
  id: string;
  user_id: string;
  amount: number;
  usdt_amount: number;
  type: string;
  status: string;
  phone_number?: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

// Transaction type definition
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string; // 'credit' | 'debit'
  description?: string;
  status: string;
  balance: number;
  order_id?: string;
  created_at: string;
  updated_at: string;
}
