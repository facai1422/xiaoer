export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dashboard_stats: {
        Row: {
          id: number;
          stat_date: string;
          total_users: number;
          today_registrations: number;
          total_agents: number;
          total_merchants: number;
          today_balance_recharge: number;
          yesterday_balance_recharge: number;
          total_balance_recharge: number;
          today_withdrawal: number;
          yesterday_withdrawal: number;
          total_withdrawal: number;
          today_order_recharge: number;
          yesterday_order_recharge: number;
          total_order_recharge: number;
          today_commission: number;
          yesterday_commission: number;
          total_commission: number;
          today_trade_count: number;
          yesterday_trade_count: number;
          total_trade_count: number;
          today_trade_amount: number;
          yesterday_trade_amount: number;
          total_trade_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dashboard_stats']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['dashboard_stats']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, never>;
        Update: Record<string, never>;
      };
    };
    Functions: {
      refresh_dashboard_stats: {
        Args: Record<string, never>;
        Returns: { success: boolean; message?: string; data?: Json };
      };
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: { success: boolean; data?: Json; message?: string };
      };
    };
  };
}
