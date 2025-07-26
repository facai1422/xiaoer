
import db from '../database';

export interface Wallet {
  id: number;
  user_id: number;
  address: string;
  currency: string;
  balance: number;
  created_at: string;
}

export const walletModel = {
  create: (data: Omit<Wallet, 'id' | 'balance' | 'created_at'>) => {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    const newWallet = {
      ...data,
      id: Date.now(),
      balance: 0,
      created_at: new Date().toISOString()
    };
    wallets.push(newWallet);
    localStorage.setItem('wallets', JSON.stringify(wallets));
    return newWallet;
  },

  findByUser: (userId: number): Wallet[] => {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    return wallets.filter((wallet: Wallet) => wallet.user_id === userId);
  },

  updateBalance: (walletId: number, amount: number) => {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    const updatedWallets = wallets.map((wallet: Wallet) => 
      wallet.id === walletId 
        ? {...wallet, balance: wallet.balance + amount}
        : wallet
    );
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    return true;
  }
};
