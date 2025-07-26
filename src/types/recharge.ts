
export interface RechargeEntry {
  cardInfo: string;
  name: string;
  amount: string;
}

export interface CreateOrderParams {
  phoneNumber: string;
  name: string;
  amount: number;
  userId: string;
  type: string;
}
