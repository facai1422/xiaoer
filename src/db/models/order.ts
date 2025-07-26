
import db from '../database';

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  amount: number;
  status: string;
  created_at: string;
}

export const orderModel = {
  create: (data: Omit<Order, 'id' | 'created_at'>) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  },

  updateStatus: (orderId: number, status: string) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = orders.map((order: Order) => 
      order.id === orderId ? {...order, status} : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return true;
  }
};
