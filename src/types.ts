export interface User {
  id: string;
  name: string;
  role: 'admin' | 'recepcionist';
  avatar?: string;
  username: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
}

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance' | 'disabled';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number; // Added to track profit reliably
  timestamp: string;
}

export interface Payment {
  amount: number;
  method: 'Efectivo' | 'Visa' | 'Mastercard' | 'Yape' | 'Plin';
  timestamp: string;
}

export interface Guest {
  id: string;
  name: string;
  documentType: 'DNI' | 'RUC' | 'CE' | 'Pasaporte';
  documentNumber: string;
  roomId: string;
  checkIn: string;
  checkOut?: string;
  orders: OrderItem[];
  payments: Payment[];
  totalExpected: number;
}

export interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: 'Simple' | 'Doble' | 'Matrimonial' | 'Triple' | 'Suite';
  price: number;
  status: RoomStatus;
  currentGuestId?: string;
}

export interface SaleRecord {
  id: string;
  timestamp: string;
  guestName: string;
  roomNumber: string;
  amount: number;
  method: string;
  type: 'Hospedaje' | 'Producto' | 'General';
}
