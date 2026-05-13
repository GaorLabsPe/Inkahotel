export interface ShiftClosure {
  id: string;
  shiftId: string;
  userId: string;
  closingTime: string;
  startingCash: number;
  totalSales: number;
  expectedEndingCash: number;
  actualEndingCash: number;
  discrepancy: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'recepcionist';
  avatar?: string;
  username: string;
  password?: string;
  phone?: string;
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
  isOpen?: boolean;
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
  isCourtesy?: boolean;
  cost: number; // Added to track profit reliably
  timestamp: string;
}

export interface Payment {
  amount: number;
  method: 'Efectivo' | 'Visa' | 'Mastercard' | 'Yape' | 'Plin' | 'Pagar al Salir';
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
  expectedCheckOut?: string;
  companyName?: string;
  companyRuc?: string;
  orders: OrderItem[];
  payments: Payment[];
  totalExpected: number;
  overridePrice?: number;
  priceChangeReason?: string;
  paymentTiming?: 'now' | 'checkout';
}

export interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  documentType?: 'DNI' | 'RUC' | 'CE' | 'Pasaporte';
  documentNumber?: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  companyName?: string;
  companyRuc?: string;
  depositAmount?: number;
  paymentMethod?: Payment['method'];
  paymentTiming?: 'now' | 'checkout';
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  price: number;
  status: RoomStatus;
  currentGuestId?: string;
}

export interface RoomType {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
  capacity: number;
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

export interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}
