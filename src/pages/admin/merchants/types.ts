
export interface Merchant {
  id: string;
  user_id: string;
  avatar_url?: string | null;
  nickname: string | null;
  phone: string | null;
  commission: any;
  account_balance: number;
  freeze_balance: number;
  team_count: number;
  status: boolean;
  ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchParams {
  nickname?: string;
  phone?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
