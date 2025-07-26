
import db from '../database';

export interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  balance: number;
  description: string;
  created_at: string;
}

export const transactionModel = {
  create: (data: Omit<Transaction, 'id' | 'created_at'>) => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return newTransaction;
  }
};
