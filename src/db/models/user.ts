
import db from '../database';

export interface User {
  id: number;
  phone: string;
  password: string;
  nickname?: string;
  avatar?: string;
  balance: number;
  created_at: string;
}

export const userModel = {
  create: (data: Omit<User, 'id' | 'balance' | 'created_at'>) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = {
      ...data,
      id: Date.now(),
      balance: 0,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  },

  findByPhone: (phone: string): User | undefined => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((user: User) => user.phone === phone);
  },

  updateBalance: (userId: number, amount: number) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: User) => 
      user.id === userId 
        ? {...user, balance: user.balance + amount}
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  }
};
