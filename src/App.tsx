import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Hotel, 
  LayoutDashboard, 
  BedDouble, 
  ShoppingCart, 
  Settings, 
  FileText, 
  Plus, 
  LogOut, 
  Search, 
  UserPlus, 
  Smartphone, 
  CreditCard, 
  Banknote,
  ChevronRight,
  Package,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  X,
  LayoutGrid,
  Calendar,
  ChevronLeft,
  Bed,
  Star,
  User as UserIcon,
  ShieldAlert,
  Building2,
  LogIn,
  Facebook,
  Instagram,
  MapPin,
  Phone,
  MessageCircle,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, RoomStatus, Guest, Product, SaleRecord, OrderItem, Payment, Reservation, User, Shift, ShiftClosure, RoomType, HotelInfo } from './types';
import { supabase } from './lib/supabase';

// Initial Mock Data
const INITIAL_HOTEL_INFO: HotelInfo = {
  name: 'Suite Estrella',
  address: 'Av. Principal 123, Lima - Perú',
  phone: '01 234 5678',
  whatsapp: '987654321',
  facebook: 'facebook.com/elitegestion',
  instagram: 'instagram.com/elitegestion',
  tiktok: 'tiktok.com/@elitegestion'
};

const INITIAL_ROOM_TYPES: RoomType[] = [
  { id: 'rt1', name: 'Simple', basePrice: 60, capacity: 1 },
  { id: 'rt2', name: 'Doble', basePrice: 100, capacity: 2 },
  { id: 'rt3', name: 'Matrimonial', basePrice: 120, capacity: 2 },
  { id: 'rt4', name: 'Triple', basePrice: 150, capacity: 3 },
  { id: 'rt5', name: 'Suite', basePrice: 200, capacity: 2 },
];

const INITIAL_ROOMS: Room[] = [
  { id: '1', number: '101', floor: 1, type: 'Simple', price: 60, status: 'available' },
  { id: '2', number: '102', floor: 1, type: 'Simple', price: 60, status: 'occupied', currentGuestId: 'g1' },
  { id: '3', number: '103', floor: 1, type: 'Doble', price: 100, status: 'available' },
  { id: '4', number: '201', floor: 2, type: 'Matrimonial', price: 120, status: 'dirty' },
  { id: '5', number: '202', floor: 2, type: 'Simple', price: 60, status: 'available' },
  { id: '6', number: '203', floor: 2, type: 'Suite', price: 200, status: 'available' },
  { id: '7', number: '301', floor: 3, type: 'Matrimonial', price: 120, status: 'available' },
  { id: '8', number: '302', floor: 3, type: 'Triple', price: 150, status: 'available' },
  { id: '9', number: '401', floor: 4, type: 'Suite', price: 250, status: 'available' },
  { id: '10', number: '402', floor: 4, type: 'Matrimonial', price: 120, status: 'available' },
  { id: '11', number: '501', floor: 5, type: 'Simple', price: 70, status: 'maintenance' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Agua San Mateo 500ml', price: 3.50, cost: 1.50, stock: 50, category: 'Bebidas' },
  { id: 'p2', name: 'Inca Kola 500ml', price: 4.50, cost: 2.50, stock: 40, category: 'Bebidas' },
  { id: 'p3', name: 'Cerveza Pilsen 330ml', price: 8.00, cost: 4.50, stock: 24, category: 'Bebidas' },
  { id: 'p4', name: 'Papitas Lay\'s Clásicas', price: 5.00, cost: 3.00, stock: 30, category: 'Snacks' },
  { id: 'p5', name: 'Chicles Trident', price: 1.50, cost: 0.80, stock: 100, category: 'Snacks' },
  { id: 'p6', name: 'Preservativos Gents x3', price: 12.00, cost: 6.00, stock: 15, category: 'Otros' },
  { id: 'p7', name: 'Cerveza Cristal 650ml', price: 12.00, cost: 8.00, stock: 12, category: 'Bebidas' },
];

const INITIAL_GUESTS: Guest[] = [
  { 
    id: 'g1', 
    name: 'Juan Pérez', 
    documentType: 'DNI', 
    documentNumber: '44556677', 
    roomId: '2', 
    checkIn: new Date().toISOString(), 
    orders: [], 
    payments: [{ amount: 60, method: 'Yape', timestamp: new Date().toISOString() }],
    totalExpected: 60 
  }
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'res1', roomId: '1', guestName: 'Pedro Sanchez', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], status: 'confirmed' },
  { id: 'res2', roomId: '3', guestName: 'Maria Garcia', startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], endDate: new Date(Date.now() + 345600000).toISOString().split('T')[0], status: 'confirmed' },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Administrador', role: 'admin', username: 'admin', password: '123' },
  { id: 'u2', name: 'Karla Gomez', role: 'recepcionist', username: 'karla', password: '123', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 'u3', name: 'Diego Torres', role: 'recepcionist', username: 'diego', password: '123', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [startingCash, setStartingCash] = useState<string>('0');
  
  const updateShiftSales = (amount: number) => {
    if (currentShift) {
      setCurrentShift(prev => prev ? {
        ...prev,
        totalSales: prev.totalSales + amount
      } : null);
    }
  };

  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'inventory' | 'reports' | 'config'>('rooms');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(INITIAL_ROOM_TYPES);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(INITIAL_HOTEL_INFO);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const handleCloseShift = async (actualCash: number, notes: string) => {
    if (!currentShift) return;

    const expectedEndingCash = currentShift.startingCash + currentShift.totalSales;
    const discrepancy = actualCash - expectedEndingCash;

    const closure: ShiftClosure = {
      id: Math.random().toString(36).substr(2, 9),
      shiftId: currentShift.id,
      userId: currentUser?.id || '',
      closingTime: new Date().toISOString(),
      startingCash: currentShift.startingCash,
      totalSales: currentShift.totalSales,
      expectedEndingCash,
      actualEndingCash: actualCash,
      discrepancy,
      notes
    };

    const { error } = await supabase.from('shift_closures').insert(closure);
    if (error) { alert('Error cerrando turno: ' + error.message); return; }

    // Close the shift locally and session
    setCurrentShift(null);
    setCurrentUser(null);
    setIsCloseShiftOpen(false);
  };

  const [actualCash, setActualCash] = useState<string>('0');
  const [shiftNotes, setShiftNotes] = useState<string>('');
  
  const ShiftSummaryModal = () => {
    if (!currentShift) return null;
    
    const shiftSales = sales.filter(s => s.timestamp >= currentShift.startTime);
    const summaryByMethod = shiftSales.reduce((acc, sale) => {
      acc[sale.method] = (acc[sale.method] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Resumen del Turno</h2>
          
          <div className="space-y-4 mb-6">
            {Object.entries(summaryByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-600">{method}</span>
                <span className="font-black text-slate-900">S/ {amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-slate-900 text-white rounded-xl">
              <span className="font-bold">Total Ventas</span>
              <span className="font-black">S/ {currentShift.totalSales.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Arqueo de Efectivo</label>
            <input 
              type="number" 
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              className="w-full text-lg font-black p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Monto en efectivo real"
            />
          </div>

          <div className="flex gap-3">
             <button 
                onClick={() => {
                  setCurrentUser(null);
                  setIsCloseShiftOpen(false);
                }}
                className="flex-1 py-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200"
              >
                Solo Salir
              </button>
              
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => {
                    handleCloseShift(parseFloat(actualCash), shiftNotes);
                  }}
                  className="flex-1 py-4 rounded-xl font-bold bg-red-600 text-white"
                >
                  Cerrar y Contabilizar
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  // Supabase Data Sync
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Hotel Info
        const { data: hotelData } = await supabase.from('hotel_info').select('*').single();
        if (hotelData) setHotelInfo(hotelData);

        // Fetch Users
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) setUsers(usersData);

        // Fetch Room Types
        const { data: rtData } = await supabase.from('room_types').select('*');
        if (rtData) setRoomTypes(rtData);

        // Fetch Rooms
        const { data: roomsData } = await supabase.from('rooms').select('*');
        if (roomsData) setRooms(roomsData);

        // Fetch Products
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) setProducts(productsData);

        // Fetch Guests
        const { data: guestsData } = await supabase.from('guests').select('*');
        if (guestsData) setGuests(guestsData);

        // Fetch Sales
        const { data: salesData } = await supabase.from('sales').select('*');
        if (salesData) setSales(salesData || []);

        // Fetch Reservations
        const { data: resData } = await supabase.from('reservations').select('*');
        if (resData) setReservations(resData);

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleExportInventory = () => {
    const header = "ID,Nombre,Categoria,Costo,Precio,Stock,Ganancia\n";
    const rows = products.map(p => 
      `${p.id},"${p.name}","${p.category}",${p.cost},${p.price},${p.stock},${(p.price - p.cost).toFixed(2)}`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [roomsViewMode, setRoomsViewMode] = useState<'grid' | 'calendar'>('grid');
  
  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [payNow, setPayNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Efectivo');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{method: Payment['method'], amount: number}[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentTicket, setCurrentTicket] = useState<{guest: Guest, room: Room} | null>(null);
  const [checkInCart, setCheckInCart] = useState<{productId: string, quantity: number, isCourtesy?: boolean}[]>([]);
  const [shopCart, setShopCart] = useState<{productId: string, quantity: number, isCourtesy?: boolean}[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserLocal, setEditingUserLocal] = useState<User | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  
  const [reportDateRange, setReportDateRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [isShiftFilterActive, setIsShiftFilterActive] = useState(false);

  const [priceOverride, setPriceOverride] = useState<string>('');
  const [stayDays, setStayDays] = useState<number>(1);
  const [isCorporate, setIsCorporate] = useState(false);
  const [expectedCheckout, setExpectedCheckout] = useState<Date>(new Date());
  const [checkInName, setCheckInName] = useState('');
  const [checkInDocType, setCheckInDocType] = useState<'DNI' | 'RUC' | 'CE' | 'Pasaporte'>('DNI');
  const [checkInDocNum, setCheckInDocNum] = useState('');
  const [checkInCompany, setCheckInCompany] = useState('');
  const [checkInCompanyRuc, setCheckInCompanyRuc] = useState('');
  const [checkInDeposit, setCheckInDeposit] = useState(0); 
  const [checkInPriceReason, setCheckInPriceReason] = useState('');

  const calculateDefaultCheckout = (checkInTime: Date, days: number) => {
    const checkout = new Date(checkInTime);
    if (checkInTime.getHours() < 12) {
      // AM: 12 hours per day/block
      checkout.setHours(checkInTime.getHours() + (12 * days));
    } else {
      // PM: 12 PM next day (standard)
      checkout.setDate(checkInTime.getDate() + days);
      checkout.setHours(12, 0, 0, 0);
    }
    return checkout;
  };

  useEffect(() => {
    if (isCheckInOpen && selectedRoom) {
      setExpectedCheckout(calculateDefaultCheckout(new Date(), stayDays));
    }
  }, [isCheckInOpen, stayDays, selectedRoom]);

  const stats = useMemo(() => {
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const available = rooms.filter(r => r.status === 'available').length;
    const dirty = rooms.filter(r => r.status === 'dirty').length;
    
    // Filter sales by date range
    const filteredSales = sales.filter(s => {
      const saleDate = s.timestamp.split('T')[0];
      return saleDate >= reportDateRange.start && saleDate <= reportDateRange.end;
    });

    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.amount, 0);
    
    // Estimate total profit based on filtered sales
    // Since we now track cost in OrderItem, we could technically calculate real profit if we summed up all related orders
    // For simplicity in this demo, we'll estimate a 40% margin on products and 80% on rooms if cost isn't explicitly tracked per sale record
    const estimatedProfit = filteredSales.reduce((acc, s) => {
      if (s.type === 'Hospedaje') return acc + (s.amount * 0.75); // 75% margin estimate for rooms
      return acc + (s.amount * 0.35); // 35% margin estimate for products
    }, 0);
    
    // Shift specific stats
    const shiftSales = currentShift ? sales.filter(s => s.timestamp >= currentShift.startTime) : [];
    const shiftRevenue = shiftSales.reduce((acc, s) => acc + s.amount, 0);
    
    const corporateMap: Record<string, { company: string, ruc: string | undefined, stays: number, days: number, revenue: number }> = {};
    
    reservations.forEach(res => {
      if (!res.companyName) return;
      
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const revenue = (res.totalPrice || 0);

      if (!corporateMap[res.companyName]) {
        corporateMap[res.companyName] = { company: res.companyName, ruc: res.companyRuc, stays: 0, days: 0, revenue: 0 };
      }
      corporateMap[res.companyName].stays += 1;
      corporateMap[res.companyName].days += days;
      corporateMap[res.companyName].revenue += revenue;
    });

    const corporateStats = Object.values(corporateMap).sort((a, b) => b.days - a.days);
    
    return { 
      occupied, 
      available, 
      dirty, 
      totalRevenue, 
      estimatedProfit, 
      filteredSales, 
      shiftRevenue, 
      shiftSales,
      corporateStats 
    };
  }, [rooms, sales, reportDateRange, currentShift, reservations]);

  // Handlers
  const handleCheckIn = async (guestData: Partial<Guest>, finalPayments: {method: Payment['method'], amount: number}[]) => {
    if (!selectedRoom) return;

    const finalRoomPrice = parseFloat(priceOverride) || selectedRoom.price || 0;

    const cartItems = checkInCart.map(item => {
      const p = products.find(prod => prod.id === item.productId)!;
      return { ...item, product: p };
    });

    const cartTotal = cartItems.reduce((acc, item) => acc + ((item.isCourtesy ? 0 : item.product.price) * item.quantity), 0);
    const totalToPay = (finalRoomPrice * stayDays) + cartTotal;

    const guestOrders: OrderItem[] = cartItems.map(item => ({
      productId: item.productId,
      name: item.product.name + (item.isCourtesy ? ' (Cortesía)' : ''),
      quantity: item.quantity,
      price: item.isCourtesy ? 0 : item.product.price,
      isCourtesy: item.isCourtesy,
      cost: item.product.cost,
      timestamp: new Date().toISOString()
    }));

    if (selectedRoom.type === 'Suite') {
      const wine = products.find(p => p.name.toLowerCase().includes('vino'));
      if (wine) {
        guestOrders.push({
          productId: wine.id,
          name: wine.name + ' (Cortesía Suite)',
          quantity: 1,
          price: 0,
          isCourtesy: true,
          cost: wine.cost,
          timestamp: new Date().toISOString()
        });
      }
    }

    const paymentRecords: Payment[] = finalPayments.map(p => ({
      amount: p.amount,
      method: p.method,
      timestamp: new Date().toISOString()
    }));

    const newGuest: Guest = {
      id: Math.random().toString(36).substr(2, 9),
      name: guestData.name || 'Huésped Anónimo',
      documentType: guestData.documentType || 'DNI',
      documentNumber: guestData.documentNumber || '',
      roomId: selectedRoom.id,
      checkIn: new Date().toISOString(),
      expectedCheckOut: guestData.expectedCheckOut,
      companyName: guestData.companyName,
      companyRuc: guestData.companyRuc,
      orders: guestOrders,
      payments: paymentRecords,
      totalExpected: totalToPay,
      overridePrice: parseFloat(priceOverride) || undefined,
      priceChangeReason: checkInPriceReason || undefined
    };

    // Supabase transactions
    try {
      const { error: guestError } = await supabase.from('guests').insert(newGuest);
      if (guestError) throw guestError;

      const { error: roomError } = await supabase.from('rooms').update({ 
        status: 'occupied', 
        currentGuestId: newGuest.id 
      }).eq('id', selectedRoom.id);
      if (roomError) throw roomError;

      const newSales: SaleRecord[] = finalPayments.map(p => ({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        guestName: newGuest.name,
        roomNumber: selectedRoom.number,
        amount: p.amount,
        method: p.method,
        type: 'Hospedaje'
      }));

      const { error: salesError } = await supabase.from('sales').insert(newSales);
      if (salesError) throw salesError;

      // Update Local State
      setGuests([...guests, newGuest]);
      setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, status: 'occupied', currentGuestId: newGuest.id } : r));
      setSales([...sales, ...newSales]);
      newSales.forEach(s => updateShiftSales(s.amount));

      setCurrentTicket({ guest: newGuest, room: selectedRoom });
      setIsCheckInOpen(false);
      setCheckInCart([]);
      setSplitPayments([]);
      setIsSplitMode(false);
      setIsTicketOpen(true);
      setPriceOverride('');
    } catch (err: any) {
      alert('Error en Check-In (Supabase): ' + err.message);
    }
  };

  const updateCheckInCart = (productId: string, delta: number, isCourtesy: boolean = false) => {
    setCheckInCart(prev => {
      const existing = prev.find(i => i.productId === productId && i.isCourtesy === isCourtesy);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => !(i.productId === productId && i.isCourtesy === isCourtesy));
        return prev.map(i => (i.productId === productId && i.isCourtesy === isCourtesy) ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { productId, quantity: delta, isCourtesy }];
      return prev;
    });
  };

  const [isCheckoutPaymentOpen, setIsCheckoutPaymentOpen] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<{roomId: string, guest: Guest, room: Room, balance: number} | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isStaySummaryOpen, setIsStaySummaryOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.number.includes(searchTerm) || 
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guests.find(g => g.roomId === room.id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm, guests]);

  const handleCheckInFromReservation = (res: Reservation) => {
    const room = rooms.find(r => r.id === res.roomId);
    if (!room) return;
    
    setSelectedRoom(room);
    setCheckInName(res.guestName);
    setCheckInDocType(res.documentType || 'DNI');
    setCheckInDocNum(res.documentNumber || '');
    setCheckInCompany(res.companyName || '');
    setCheckInCompanyRuc(res.companyRuc || '');
    setCheckInDeposit(res.paymentTiming === 'checkout' ? 0 : (res.depositAmount || 0));
    setIsCorporate(!!res.companyName);
    
    // Calculate stay days
    const start = new Date(res.startDate);
    const end = new Date(res.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setStayDays(Math.max(1, diff));
    
    setIsReservationModalOpen(false);
    setIsCheckInOpen(true);
  };

  const handleUpdateReservation = async (resData: Omit<Reservation, 'id'>) => {
    let newRes: Reservation;
    if (editingReservation) {
      newRes = { ...resData, id: editingReservation.id };
      const { error } = await supabase.from('reservations').upsert(newRes);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setReservations(reservations.map(r => r.id === editingReservation.id ? newRes : r));
    } else {
      newRes = {
        ...resData,
        id: Math.random().toString(36).substr(2, 9)
      };
      const { error } = await supabase.from('reservations').insert(newRes);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setReservations([...reservations, newRes]);
    }
    setIsReservationModalOpen(false);
    setEditingReservation(null);
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('¿Cancelar reserva?')) return;
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    setReservations(reservations.filter(r => r.id !== id));
    setIsReservationModalOpen(false);
    setEditingReservation(null);
  };

  const handleProcessOrder = async (payNow: boolean, finalPayments: {method: Payment['method'], amount: number}[]) => {
    if (shopCart.length === 0) return;

    if (!payNow && !selectedRoom) {
      alert("Para cargar a la cuenta debe seleccionar una habitación.");
      return;
    }

    const guest = selectedRoom ? guests.find(g => g.id === selectedRoom.currentGuestId) : null;

    const newOrderItems: OrderItem[] = shopCart.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        name: product.name + (item.isCourtesy ? ' (Cortesía)' : ''),
        quantity: item.quantity,
        price: item.isCourtesy ? 0 : product.price,
        isCourtesy: item.isCourtesy,
        cost: product.cost,
        timestamp: new Date().toISOString()
      };
    });

    const totalAmount = newOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const paymentRecords: Payment[] = payNow ? finalPayments.map(p => ({
      amount: p.amount,
      method: p.method,
      timestamp: new Date().toISOString()
    })) : [];

    try {
      if (guest && selectedRoom) {
        const updatedGuest = {
          ...guest,
          orders: [...guest.orders, ...newOrderItems],
          payments: [...guest.payments, ...paymentRecords],
          totalExpected: payNow ? guest.totalExpected : guest.totalExpected + totalAmount
        };
        
        const { error: guestError } = await supabase.from('guests').upsert(updatedGuest);
        if (guestError) throw guestError;

        setGuests(guests.map(g => g.id === guest.id ? updatedGuest : g));
        
        if (payNow) {
          const newSales: SaleRecord[] = finalPayments.map(p => ({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            guestName: guest.name,
            roomNumber: selectedRoom.number,
            amount: p.amount,
            method: p.method,
            type: 'Producto'
          }));
          
          const { error: salesError } = await supabase.from('sales').insert(newSales);
          if (salesError) throw salesError;

          setSales([...sales, ...newSales]);
          newSales.forEach(s => updateShiftSales(s.amount));
          
          setCurrentTicket({ 
            guest: { ...updatedGuest, orders: newOrderItems, payments: paymentRecords }, 
            room: selectedRoom 
          });
          setIsTicketOpen(true);
        }
      } else {
        const newSales: SaleRecord[] = finalPayments.map(p => ({
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          guestName: 'VENTA DIRECTA',
          roomNumber: 'N/A',
          amount: p.amount,
          method: p.method,
          type: 'General'
        }));
        
        const { error: salesError } = await supabase.from('sales').insert(newSales);
        if (salesError) throw salesError;

        setSales([...sales, ...newSales]);
        newSales.forEach(s => updateShiftSales(s.amount));
        
        setCurrentTicket({
          guest: { 
            id: 'SALE', name: 'VENTA DIRECTA', documentType: 'DNI', documentNumber: '00000000', 
            roomId: 'SALE', checkIn: new Date().toISOString(), orders: newOrderItems, 
            payments: paymentRecords, totalExpected: totalAmount 
          },
          room: { id: 'SALE', number: 'N/A', floor: 0, type: 'Simple', price: 0, status: 'available' }
        });
        setIsTicketOpen(true);
      }

      setIsOrderOpen(false);
      setShopCart([]);
      setSplitPayments([]);
      setIsSplitMode(false);
    } catch (err: any) {
      alert('Error en Venta (Supabase): ' + err.message);
    }
  };

  const updateShopCart = (productId: string, delta: number, isCourtesy: boolean = false) => {
    setShopCart(prev => {
      const existing = prev.find(i => i.productId === productId && i.isCourtesy === isCourtesy);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => !(i.productId === productId && i.isCourtesy === isCourtesy));
        return prev.map(i => (i.productId === productId && i.isCourtesy === isCourtesy) ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { productId, quantity: delta, isCourtesy }];
      return prev;
    });
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    let newProduct: Product;
    if (editingProduct) {
      newProduct = { ...productData, id: editingProduct.id };
      const { error } = await supabase.from('products').upsert(newProduct);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      newProduct = {
        ...productData,
        id: Math.random().toString(36).substr(2, 9)
      };
      const { error } = await supabase.from('products').insert(newProduct);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    setProducts(products.filter(p => p.id !== productId));
  };
  
  const handleSaveRoom = async (roomData: Omit<Room, 'id'>) => {
    let newRoom: Room;
    if (editingRoom) {
      newRoom = { ...roomData, id: editingRoom.id };
      const { error } = await supabase.from('rooms').upsert(newRoom);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setRooms(rooms.map(r => r.id === editingRoom.id ? newRoom : r));
    } else {
      newRoom = {
        ...roomData,
        id: Math.random().toString(36).substr(2, 9)
      };
      const { error } = await supabase.from('rooms').insert(newRoom);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setRooms([...rooms, newRoom]);
    }
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleSaveRoomType = async (typeData: Omit<RoomType, 'id'>) => {
    let newType: RoomType;
    if (editingRoomType) {
      newType = { ...typeData, id: editingRoomType.id };
      const { error } = await supabase.from('room_types').upsert(newType);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setRoomTypes(roomTypes.map(rt => rt.id === editingRoomType.id ? newType : rt));
    } else {
      newType = {
        ...typeData,
        id: Math.random().toString(36).substr(2, 9)
      };
      const { error } = await supabase.from('room_types').insert(newType);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setRoomTypes([...roomTypes, newType]);
    }
    setIsRoomTypeModalOpen(false);
    setEditingRoomType(null);
  };

  const handleDeleteRoomType = async (id: string) => {
    if (!confirm('¿Eliminar tipo de habitación?')) return;
    const { error } = await supabase.from('room_types').delete().eq('id', id);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    setRoomTypes(roomTypes.filter(rt => rt.id !== id));
  };

  const handleToggleRoomStatus = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const newStatus = room.status === 'disabled' ? 'available' : 'disabled';
    const { error } = await supabase.from('rooms').update({ status: newStatus }).eq('id', roomId);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    setRooms(rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('¿Eliminar habitación?')) return;
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleSaveUser = async (userData: User) => {
    const { error } = await supabase.from('users').upsert(userData);
    if (error) { alert('Error Supabase: ' + error.message); return; }
    if (users.find(u => u.id === userData.id)) {
      setUsers(users.map(u => u.id === userData.id ? userData : u));
    } else {
      setUsers([...users, userData]);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario mientras estás en sesión.');
      return;
    }
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) { alert('Error Supabase: ' + error.message); return; }
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleCheckOut = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.currentGuestId) return;

    const guest = guests.find(g => g.id === room.currentGuestId);
    if (!guest) return;

    const totalPaid = guest.payments.reduce((acc, p) => acc + p.amount, 0);
    const totalDue = guest.totalExpected;

    if (totalPaid < totalDue) {
      setPendingCheckoutData({ roomId, guest, room, balance: totalDue - totalPaid });
      setIsCheckoutPaymentOpen(true);
    } else {
      finalizeCheckout(roomId, guest, room);
    }
  };

  const finalizeCheckout = async (roomId: string, guest: Guest, room: Room, finalPayments: { amount: number, method: Payment['method'] }[] = []) => {
    const checkoutTime = new Date().toISOString();
    const paymentRecords: Payment[] = finalPayments.map(p => ({
      amount: p.amount,
      method: p.method,
      timestamp: checkoutTime
    }));

    const updatedGuest: Guest = {
      ...guest,
      checkOut: checkoutTime,
      payments: [...guest.payments, ...paymentRecords]
    };

    const newSales: SaleRecord[] = finalPayments.map(p => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: checkoutTime,
      guestName: guest.name,
      roomNumber: room.number,
      amount: p.amount,
      method: p.method,
      type: 'Hospedaje'
    }));

    try {
      // Transactional updates in Supabase
      const { error: guestError } = await supabase.from('guests').upsert(updatedGuest);
      if (guestError) throw guestError;

      const { error: roomError } = await supabase.from('rooms').update({ 
        status: 'dirty', 
        currentGuestId: null 
      }).eq('id', roomId);
      if (roomError) throw roomError;

      if (newSales.length > 0) {
        const { error: salesError } = await supabase.from('sales').insert(newSales);
        if (salesError) throw salesError;
      }

      setSales([...sales, ...newSales]);
      if (newSales.length > 0) {
        newSales.forEach(s => updateShiftSales(s.amount));
      }
      setGuests(guests.map(g => g.id === guest.id ? updatedGuest : g));
      setRooms(rooms.map(r => r.id === roomId ? { ...r, status: 'dirty', currentGuestId: undefined } : r));
      
      setCurrentTicket({ 
        guest: { ...updatedGuest, orders: [], payments: paymentRecords }, 
        room 
      });
      setIsTicketOpen(true);
      setIsCheckoutPaymentOpen(false);
      setPendingCheckoutData(null);
      setSplitPayments([]);
      setIsSplitMode(false);
    } catch (err: any) {
      alert('Error en Check-Out (Supabase): ' + err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentShift(null);
  };

  if (!currentUser) {
    return <LoginPortal hotelInfo={hotelInfo} users={users} onLogin={(user) => {
      setCurrentUser(user);
      setCurrentShift({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        startTime: new Date().toISOString(),
        startingCash: 0,
        totalSales: 0,
        isOpen: false
      });
    }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-800">
      {/* Header Navigation */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 transform hover:scale-110 transition-transform">
            <Star className="text-red-600 fill-red-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">{hotelInfo.name.split(' ')[0]} <span className="text-red-600">{hotelInfo.name.split(' ').slice(1).join(' ')}</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Hospitality Management System</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <NavHeaderItem active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} label="Recepción" />
          <NavHeaderItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} label="Inventario/Stock" />
          <NavHeaderItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Reportes" />
          <NavHeaderItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} label="Configuración" />
        </nav>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden border-2 border-white flex items-center justify-center text-white font-bold">
               {currentUser.avatar ? (
                 <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
               ) : (
                 currentUser.name[0]
               )}
            </div>
            <div className="text-left leading-tight">
               <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{currentUser.name}</p>
               <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Super Admin' : 'Cajero / Recepcionista'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCloseShiftOpen(true)}
            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all group"
            title="Cerrar Turno"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {isCloseShiftOpen && <ShiftSummaryModal />}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Optional in Theme but kept for your existing functionality, styled to theme) */}
        <nav className="w-16 lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 lg:hidden">
          {/* Mobile version of sidebar icons if needed */}
        </nav>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'rooms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="rooms">
                {currentShift && !currentShift.isOpen ? (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-md w-full text-center relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-600/5 rounded-full blur-2xl"></div>
                      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
                        <Banknote size={40} />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Apertura de Caja</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10 leading-relaxed">
                        Para iniciar las operaciones de recepción, es necesario registrar el fondo inicial de caja.
                      </p>
                      
                      <div className="space-y-6">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Saldo Inicial (S/)</label>
                          <input 
                            type="number"
                            autoFocus
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:border-red-600 outline-none transition-all shadow-inner"
                            placeholder="0.00"
                            value={startingCash}
                            onChange={e => setStartingCash(e.target.value)}
                          />
                        </div>
                        
                        <button 
                          onClick={() => {
                            if (currentShift) {
                              setCurrentShift({
                                ...currentShift,
                                startingCash: parseFloat(startingCash) || 0,
                                isOpen: true
                              });
                            }
                          }}
                          className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-red-600 transition-all transform active:scale-95"
                        >
                          Abrir Recepción
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text"
                            placeholder="Buscar Hab. o Huésped..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200 shadow-inner">
                          <button 
                            onClick={() => setRoomsViewMode('grid')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${roomsViewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:bg-slate-200'}`}
                          >
                            <LayoutGrid size={16} /> Cuadrícula
                          </button>
                          <button 
                            onClick={() => setRoomsViewMode('calendar')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${roomsViewMode === 'calendar' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:bg-slate-200'}`}
                          >
                            <Calendar size={16} /> Calendario
                          </button>
                        </div>
                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                        <button 
                          onClick={() => { setSelectedRoom(null); setIsOrderOpen(true); }}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 flex items-center gap-2"
                        >
                          <ShoppingCart size={16} /> Venta Directa
                        </button>
                        <button 
                          onClick={() => setIsReservationModalOpen(true)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                        >
                          <Plus size={16} /> Reservar
                        </button>
                      </div>

                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Libre</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Ocupado</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Limpieza</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Reserva</div>
                      </div>
                    </div>

                    {roomsViewMode === 'grid' ? (
                      <div className="space-y-16 pb-20">
                        {Array.from(new Set(filteredRooms.map(r => r.floor))).sort().map(floor => (
                          <div key={`floor-group-${floor}`} className="relative">
                            <div className="sticky top-0 z-[5] py-4 mb-8 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/50">
                              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-6">
                                 <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                                   <span className="text-slate-900 font-black">PISO {floor}</span>
                                 </div>
                                 <div className="flex-1 h-px bg-slate-200"></div>
                                 <span className="text-slate-400 font-bold tracking-widest">{filteredRooms.filter(r => r.floor === floor).length} UNIDADES</span>
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                              {filteredRooms.filter(r => r.floor === floor).map(room => (
                                <RoomCard 
                                  key={`room-card-${room.id}`} 
                                  room={room} 
                                  guestName={guests.find(g => g.roomId === room.id)?.name}
                                  paymentTiming={reservations.find(r => r.roomId === room.id && r.status === 'checked-in')?.paymentTiming}
                                  onCheckIn={() => { setSelectedRoom(room); setIsCheckInOpen(true); }}
                                  onShowSummary={() => { setSelectedRoom(room); setIsStaySummaryOpen(true); }}
                                  onAddOrder={() => { setSelectedRoom(room); setIsOrderOpen(true); }}
                                  onCheckOut={() => handleCheckOut(room.id)}
                                  onReady={(id) => setRooms(rooms.map(r => r.id === id ? { ...r, status: 'available' } : r))}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                        {filteredRooms.length === 0 && (
                          <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold">No se encontraron habitaciones.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <CalendarView 
                        rooms={rooms} 
                        reservations={reservations} 
                        onAddReservation={(roomId, date) => {
                          setSelectedRoom(rooms.find(r => r.id === roomId) || null);
                          setEditingReservation(null);
                          setIsReservationModalOpen(true);
                        }}
                        onEditReservation={(res) => {
                          setSelectedRoom(rooms.find(r => r.id === res.roomId) || null);
                          setEditingReservation(res);
                          setIsReservationModalOpen(true);
                        }}
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="inventory" className="space-y-6">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Gestión de Inventario</h2>
                      <p className="text-sm text-slate-500">Supervise stock, costos y precios de productos.</p>
                   </div>
                   <div className="flex gap-3">
                     <button 
                      onClick={handleExportInventory}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                     >
                       <FileText size={20} /> Exportar Inventario
                     </button>
                     <button 
                      onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                     >
                       <Plus size={20} /> Nuevo Producto
                     </button>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Costo (S/)</th>
                            <th className="px-6 py-4">Precio (S/)</th>
                            <th className="px-6 py-4">Ganancia (S/)</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {products.map(p => (
                           <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                 <p className="font-bold text-slate-900">{p.name}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tighter text-slate-500">{p.category}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">{p.cost.toFixed(2)}</td>
                              <td className="px-6 py-4 font-mono font-bold text-slate-900">{p.price.toFixed(2)}</td>
                              <td className="px-6 py-4 font-mono font-bold text-green-600">{(p.price - p.cost).toFixed(2)}</td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className="font-bold">{p.stock}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end gap-2 text-slate-400">
                                    <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all"><Settings size={16} /></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="reports" className="space-y-8">
                {/* Control de Turno Activo */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                            {currentUser?.avatar ? (
                              <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover rounded-3xl" />
                            ) : (
                              <UserIcon size={32} className="text-white" />
                            )}
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-1">Sesión en Curso</p>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic">{currentUser?.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-slate-400">
                               <div className="flex items-center gap-1.5">
                                  <Clock size={14} />
                                  <span className="text-[10px] font-bold uppercase">Inició: {new Date(currentShift?.startTime || '').toLocaleTimeString()}</span>
                               </div>
                               <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                               <div className="flex items-center gap-1.5">
                                  <CreditCard size={14} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">IDC: {currentShift?.id}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-4 w-full md:w-auto">
                         <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex-1 md:w-48">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Base de Caja</p>
                            <p className="text-2xl font-black tracking-tighter">S/ {currentShift?.startingCash.toFixed(2)}</p>
                         </div>
                         <div className="bg-red-600 p-6 rounded-3xl flex-1 md:w-48 shadow-lg shadow-red-600/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-2">Ventas Turno</p>
                            <p className="text-2xl font-black tracking-tighter">S/ {stats.shiftRevenue.toFixed(2)}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Dashboard Stats Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Ocupación" value={`${Math.round((stats.occupied / rooms.length) * 100)}%`} sub={`${stats.occupied} / ${rooms.length} Hab.`} icon={<BedDouble className="text-red-600" />} />
                  <StatCard label="Ventas Totales" value={`S/ ${stats.totalRevenue.toFixed(2)}`} sub={`${stats.filteredSales.length} transacciones`} icon={<Banknote className="text-blue-600" />} />
                  <StatCard label="Ganáscia Est." value={`S/ ${stats.estimatedProfit.toFixed(2)}`} sub="Utilidad bruta est." icon={<CheckCircle2 className="text-green-600" />} />
                  <StatCard label="Limpieza" value={stats.dirty} sub="Pendiente de aseo" icon={<Trash2 className="text-yellow-600" />} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 uppercase tracking-tighter">Reportes y Estadísticas Generales</h3>
                      <p className="text-xs text-slate-500">Filtrado desde {reportDateRange.start} hasta {reportDateRange.end}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => setIsShiftFilterActive(!isShiftFilterActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${isShiftFilterActive ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'}`}
                      >
                        <Clock size={16} /> {isShiftFilterActive ? 'Viendo Turno Actual' : 'Ver Solo Mi Turno'}
                      </button>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Desde</span>
                        <input type="date" value={reportDateRange.start} onChange={(e) => setReportDateRange(prev => ({...prev, start: e.target.value}))} className="text-sm font-bold bg-transparent outline-none" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Hasta</span>
                        <input type="date" value={reportDateRange.end} onChange={(e) => setReportDateRange(prev => ({...prev, end: e.target.value}))} className="text-sm font-bold bg-transparent outline-none" />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                        <Printer size={16} /> Exportar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-slate-100">
                    <div className="p-8 border-r border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Productos más vendidos</h4>
                        <div className="space-y-4">
                           {products.slice(0, 5).map((p, idx) => (
                             <div key={p.id} className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">{idx+1}</div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-end mb-1">
                                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                    <p className="text-xs font-black text-slate-500">12 und.</p>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-red-500 rounded-full" style={{ width: `${80 - idx * 15}%` }}></div>
                                  </div>
                               </div>
                             </div>
                           ))}
                        </div>
                    </div>
                    <div className="p-8">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Habitaciones Preferidas</h4>
                        <div className="grid grid-cols-2 gap-4">
                           {['102', '201', '302', '105'].map((num, idx) => (
                             <div key={num} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                  <p className="text-xl font-black text-slate-900">{num}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase">Ocupaciones: {24 - idx * 4}</p>
                                </div>
                                <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
                                  <BedDouble size={20} />
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                          <h3 className="font-bold text-xl text-slate-800 uppercase tracking-tighter">Análisis Corporativo (Empresas)</h3>
                          <p className="text-xs text-slate-500">Desempeño de huéspedes corporativos y convenios.</p>
                       </div>
                       <div className="flex gap-4">
                          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                             <p className="text-[10px] font-black uppercase text-slate-400">Total Empresas</p>
                             <p className="text-xl font-black">{stats.corporateStats.length}</p>
                          </div>
                          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                             <p className="text-[10px] font-black uppercase text-slate-400">Días Ocupados</p>
                             <p className="text-xl font-black">{stats.corporateStats.reduce((acc: number, c: any) => acc + c.days, 0)}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                       <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Días de Estancia por Empresa</h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.corporateStats.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="company" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="days" radius={[6, 6, 0, 0]} fill="#ef4444" barSize={40} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Distribución de Ingresos</h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats.corporateStats.slice(0, 5)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="revenue"
                                  nameKey="company"
                                >
                                  {stats.corporateStats.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#ef4444', '#0f172a', '#3b82f6', '#10b981', '#f59e0b'][index % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                             <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Razón Social / RUC</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Reservas</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Días Totales</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ingresos (S/)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {stats.corporateStats.length > 0 ? (
                               stats.corporateStats.map((c: any) => (
                                 <tr key={c.company} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                       <p className="font-bold text-slate-800">{c.company}</p>
                                       <p className="text-[10px] font-medium text-slate-400">{c.ruc || 'Sin RUC'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-slate-600">{c.stays}</td>
                                    <td className="px-6 py-4 text-center">
                                       <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600">{c.days} DÍAS</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-red-600">
                                       S/ {c.revenue.toFixed(2)}
                                    </td>
                                 </tr>
                               ))
                             ) : (
                               <tr>
                                 <td colSpan={4} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                       <Building2 size={40} />
                                       <p className="text-sm font-black uppercase tracking-widest">Sin datos corporativos</p>
                                    </div>
                                 </td>
                               </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-6 py-4">Fecha/Hora</th>
                          <th className="px-6 py-4">Concepto</th>
                          <th className="px-6 py-4">Huésped</th>
                          <th className="px-6 py-4">Método</th>
                          <th className="px-6 py-4 text-right">Total (S/)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(isShiftFilterActive ? stats.shiftSales : stats.filteredSales).length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No hay ventas registradas en este periodo</td></tr>
                        ) : (
                          (isShiftFilterActive ? stats.shiftSales : stats.filteredSales).slice().reverse().map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs">
                                {new Date(sale.timestamp).toLocaleDateString()} {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${sale.type === 'Hospedaje' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {sale.type} - Hab {sale.roomNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">{sale.guestName}</td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-black uppercase text-slate-400">{sale.method}</span>
                              </td>
                              <td className="px-6 py-4 text-right font-black text-slate-900">S/ {sale.amount.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      { (isShiftFilterActive ? stats.shiftSales : stats.filteredSales).length > 0 && (
                        <tfoot>
                          <tr className="bg-slate-900 text-white font-black">
                            <td colSpan={4} className="px-6 py-4 text-right uppercase tracking-[0.2em] text-[10px]">Total Vendido</td>
                            <td className="px-6 py-4 text-right text-xl">S/ {(isShiftFilterActive ? stats.shiftRevenue : stats.totalRevenue).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'config' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="config" className="space-y-8 pb-20">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Gestión del Hotel</h2>
                      <p className="text-sm text-slate-500">Configure habitaciones, categorías y precios.</p>
                   </div>
                </div>

                {/* Section: Hotel Information (Admin Only) */}
                {currentUser?.role === 'admin' && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-900 flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white">Información de la Empresa</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Datos visibles en perfiles y reportes</p>
                      </div>
                      <Building2 size={24} className="text-white/20" />
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Nombre Comercial</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.name}
                            onChange={e => setHotelInfo({...hotelInfo, name: e.target.value})}
                          />
                          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1 lg:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Dirección Fiscal / Local</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.address}
                            onChange={e => setHotelInfo({...hotelInfo, address: e.target.value})}
                          />
                          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Teléfono Central</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.phone}
                            onChange={e => setHotelInfo({...hotelInfo, phone: e.target.value})}
                          />
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">WhatsApp</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.whatsapp}
                            onChange={e => setHotelInfo({...hotelInfo, whatsapp: e.target.value})}
                          />
                          <MessageCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Facebook</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.facebook}
                            onChange={e => setHotelInfo({...hotelInfo, facebook: e.target.value})}
                          />
                          <Facebook size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Instagram</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.instagram}
                            onChange={e => setHotelInfo({...hotelInfo, instagram: e.target.value})}
                          />
                          <Instagram size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">TikTok / Otros</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
                            value={hotelInfo.tiktok}
                            onChange={e => setHotelInfo({...hotelInfo, tiktok: e.target.value})}
                          />
                          <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: User Management (Admin Only) */}
                {currentUser?.role === 'admin' && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-900 flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white">Gestión de Usuarios y Personal</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configura los accesos de tus recepcionistas</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingUserLocal(null);
                          setIsUserModalOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <UserPlus size={14} /> Nuevo Usuario
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 italic">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Personal</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol / Rango</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4 font-bold text-slate-700 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <UserIcon size={16} />
                                </div>
                                {user.name}
                              </td>
                              <td className="px-8 py-4 text-xs font-mono text-slate-500">{user.username}</td>
                              <td className="px-8 py-4 text-xs font-bold text-slate-600">{user.phone || '-'}</td>
                              <td className="px-8 py-4">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {user.role === 'admin' ? 'Administrador' : 'Recepcionista'}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <button 
                                    onClick={() => {
                                      setEditingUserLocal(user);
                                      setIsUserModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-all"
                                    title="Editar usuario"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                    title="Eliminar usuario"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section: Room Types */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Categorías de Habitación</h3>
                    <button 
                      onClick={() => { setEditingRoomType(null); setIsRoomTypeModalOpen(true); }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <Plus size={14} className="inline mr-1" /> Nueva Categoría
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roomTypes.map(type => (
                      <div key={type.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-red-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <Hotel size={24} />
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => { setEditingRoomType(type); setIsRoomTypeModalOpen(true); }}
                              className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                              <Settings size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteRoomType(type.id)}
                              className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight mb-1">{type.name}</h4>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">{type.description || 'Sin descripción'}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Precio Base</p>
                            <p className="font-black text-slate-900">S/ {type.basePrice.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacidad</p>
                            <p className="font-bold text-slate-700">{type.capacity} {type.capacity === 1 ? 'Persona' : 'Personas'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Inventario de Habitaciones</h3>
                    <button 
                      onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                    >
                      <Plus size={20} /> Nueva Habitación
                    </button>
                  </div>

                  <div className="space-y-8">
                  {Array.from(new Set(rooms.map(r => r.floor))).sort().map(floor => (
                    <div key={`config-floor-${floor}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
                        <h3 className="font-black text-sm uppercase tracking-[0.2em]">PISO {floor}</h3>
                        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded font-bold uppercase">{rooms.filter(r => r.floor === floor).length} Habitaciones</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                              <th className="px-6 py-4">N°</th>
                              <th className="px-6 py-4">Tipo</th>
                              <th className="px-6 py-4">Precio (S/)</th>
                              <th className="px-6 py-4">Estado</th>
                              <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rooms.filter(r => r.floor === floor).map(room => (
                              <tr key={`config-room-row-${room.id}`} className={`hover:bg-slate-50/50 transition-colors ${room.status === 'disabled' ? 'opacity-50 grayscale' : ''}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-800">{room.number}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-slate-700">{room.type}</span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900">S/ {room.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                                    room.status === 'available' ? 'bg-green-100 text-green-700' :
                                    room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                                    room.status === 'disabled' ? 'bg-slate-200 text-slate-500' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {room.status === 'available' ? 'Activa' : 
                                     room.status === 'occupied' ? 'En Uso' : 
                                     room.status === 'disabled' ? 'Deshabilitada' : room.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2 text-slate-400">
                                    <button 
                                      onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }}
                                      className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all"
                                      title="Editar"
                                    >
                                      <Settings size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleToggleRoomStatus(room.id)}
                                      className={`p-2 rounded-lg transition-all ${room.status === 'disabled' ? 'text-green-600 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                      title={room.status === 'disabled' ? 'Habilitar' : 'Deshabilitar'}
                                    >
                                      {room.status === 'disabled' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteRoom(room.id)}
                                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {/* Check-In Modal */}
      <AnimatePresence>
        {isCheckInOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
                  <UserPlus className="text-red-600" /> Registro de Ingreso
                </h3>
                <button onClick={() => { setIsCheckInOpen(false); setCheckInCart([]); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Formulario de Huésped (Izquierda) */}
                <div className="flex-1 p-8 space-y-6 overflow-y-auto border-r border-slate-100">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white border-2 border-red-500 rounded-lg flex items-center justify-center text-red-600 font-black text-xl">
                      {selectedRoom?.number}
                    </div>
                    <div>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Habitación Seleccionada</p>
                      <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">{selectedRoom?.type} <span className="text-slate-400 mx-2">|</span> S/ {selectedRoom?.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Huésped</label>
                      <input 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" 
                        placeholder="Apellidos y Nombres" 
                        value={checkInName}
                        onChange={e => setCheckInName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Doc.</label>
                      <select 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold"
                        value={checkInDocType}
                        onChange={e => setCheckInDocType(e.target.value as any)}
                      >
                        <option>DNI</option>
                        <option>RUC</option>
                        <option>CE</option>
                        <option>Pasaporte</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">N° Documento</label>
                      <input 
                        required 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" 
                        placeholder="Documento" 
                        value={checkInDocNum}
                        onChange={e => setCheckInDocNum(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="col-span-full">
                      <button 
                        onClick={() => setIsCorporate(!isCorporate)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${isCorporate ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>
                          {isCorporate && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        ¿Es Huésped de Empresa?
                      </button>
                    </div>

                    {isCorporate && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa (Razón Social)</label>
                          <input 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" 
                            placeholder="Razón Social" 
                            value={checkInCompany}
                            onChange={e => setCheckInCompany(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RUC Empresa</label>
                          <input 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" 
                            placeholder="20XXXXXXXXX" 
                            value={checkInCompanyRuc}
                            onChange={e => setCheckInCompanyRuc(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Salida Programada</label>
                      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black uppercase opacity-60">Fecha y Hora de Salida</p>
                        <p className="text-sm font-black tracking-tighter">
                          {expectedCheckout.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {expectedCheckout.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bloques (Stays)</label>
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button 
                          onClick={() => setStayDays(Math.max(1, stayDays - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-black hover:bg-slate-50 active:scale-95 transition-all text-slate-600 shadow-sm"
                        >-</button>
                        <span className="flex-1 text-center font-black text-lg text-slate-800">{stayDays}</span>
                        <button 
                          onClick={() => setStayDays(stayDays + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-black hover:bg-slate-50 active:scale-95 transition-all text-slate-600 shadow-sm"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precio por Día Pactado (S/)</label>
                      <input 
                        id="override-price" 
                        type="number" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" 
                        placeholder={selectedRoom?.price.toFixed(2)}
                        value={priceOverride}
                        onChange={(e) => setPriceOverride(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivo del Ajuste</label>
                      <input 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold italic" 
                        placeholder="Ej: Tarifa Corporativa, descuento, etc." 
                        value={checkInPriceReason}
                        onChange={e => setCheckInPriceReason(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Método de Pago Principal</label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsSplitMode(!isSplitMode)} 
                          className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${isSplitMode ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {isSplitMode ? '✓ Pago Combinado' : '+ Combinar Métodos'}
                        </button>
                      </div>
                    </div>
                    
                    {!isSplitMode ? (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard', 'Pagar al Salir'].map(m => (
                          <button 
                            key={`pay-method-1-${m}`}
                            onClick={() => setPaymentMethod(m as any)}
                            className={`py-3 border-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${paymentMethod === m ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map(m => (
                            <div key={`split-pay-1-${m}`} className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-400 w-16 uppercase">{m}</span>
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">S/</span>
                                <input 
                                  type="number" 
                                  placeholder="0.00"
                                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-red-600"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setSplitPayments(prev => {
                                      const filtered = prev.filter(p => p.method !== m);
                                      if (val > 0) return [...filtered, { method: m as any, amount: val }];
                                      return filtered;
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Monto Registrado</p>
                              <p className="text-sm font-black text-slate-900">S/ {splitPayments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Resta por Cobrar</p>
                              <p className="text-sm font-black text-red-600">
                               S/ {Math.max(0, (((parseFloat(priceOverride) || selectedRoom?.price || 0) * stayDays) + checkInCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0)) - splitPayments.reduce((acc, p) => acc + p.amount, 0) - checkInDeposit).toFixed(2)}
                              </p>
                           </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>


                {/* Catálogo de Productos (Derecha) */}
                <div className="w-full lg:w-96 bg-slate-50 p-6 flex flex-col overflow-hidden">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShoppingCart size={14} /> Venta Rápida (Consumo)
                  </h4>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
                    {products.map(product => {
                      const inCart = checkInCart.find(i => i.productId === product.id);
                      return (
                        <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-red-500 transition-all">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{product.category}</p>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{product.name}</p>
                            <p className="text-xs font-black text-red-600">S/ {product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                            {inCart ? (
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                  <button onClick={() => updateCheckInCart(product.id, -1, inCart.isCourtesy)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold">-</button>
                                  <span className="text-sm font-black w-4 text-center tabular-nums">{inCart.quantity}</span>
                                  <button onClick={() => updateCheckInCart(product.id, 1, inCart.isCourtesy)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold">+</button>
                                </div>
                                <button 
                                  onClick={() => {
                                    setCheckInCart(prev => prev.map(i => i.productId === product.id ? { ...i, isCourtesy: !i.isCourtesy } : i));
                                  }}
                                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-all ${inCart.isCourtesy ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                                >
                                  Cortesía
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => updateCheckInCart(product.id, 1)} className="px-3 py-1 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors">Añadir</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/20">
                    <div className="space-y-2 mb-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                      <div className="flex justify-between">
                        <span>Hospedaje ({stayDays} {stayDays === 1 ? 'Día' : 'Días'})</span>
                        <span>S/ {((parseFloat(priceOverride) || selectedRoom?.price || 0) * stayDays).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between italic">
                        <span>Venta Adicional</span>
                        <span>S/ {checkInCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0).toFixed(2)}</span>
                      </div>
                      {checkInDeposit > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>Adelanto Reserva</span>
                          <span>- S/ {checkInDeposit.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total a Pagar Hoy</p>
                        <p className="text-3xl font-black tabular-nums">
                          S/ {Math.max(0, (((parseFloat(priceOverride) || selectedRoom?.price || 0) * stayDays) + checkInCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0)) - checkInDeposit).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                         <span className="inline-block px-2 py-1 bg-green-500 text-[9px] font-black rounded uppercase tracking-tighter mb-1">Cobro Adelantado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0 shadow-lg">
                <button 
                  type="button" 
                  onClick={() => { 
                    setIsCheckInOpen(false); 
                    setCheckInCart([]); 
                    setSplitPayments([]); 
                    setIsSplitMode(false); 
                    setStayDays(1); 
                    setPriceOverride(''); 
                    setCheckInName('');
                    setCheckInDocType('DNI');
                    setCheckInDocNum('');
                    setCheckInCompany('');
                    setCheckInCompanyRuc('');
                    setCheckInDeposit(0);
                    setCheckInPriceReason('');
                  }} 
                  className="flex-1 py-4 border-2 border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (!checkInName || !checkInDocNum) {
                      alert("Por favor complete los datos del huésped.");
                      return;
                    }

                    const finalRoomPrice = parseFloat(priceOverride) || selectedRoom?.price || 0;
                    const totalToPay = (finalRoomPrice * stayDays) + checkInCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0);
                    
                    // Subtract what was already paid as deposit if any
                    const remainingToPay = totalToPay - checkInDeposit;

                    const paymentsToProcess = isSplitMode ? splitPayments : [{ method: paymentMethod, amount: Math.max(0, remainingToPay) }];
                    const paidAmountNow = paymentsToProcess.reduce((acc, p) => acc + p.amount, 0);

                    if (paidAmountNow < remainingToPay - 0.01 && remainingToPay > 0) {
                      alert(`Monto insuficiente. Faltan S/ ${(remainingToPay - paidAmountNow).toFixed(2)}`);
                      return;
                    }

                    // If they have a deposit, we should record it as a past payment possibly, 
                    // or just handle it in the total paid.
                    // For logic simplicity, we'll add the deposit as a payment if it exists.
                    const allPayments = checkInDeposit > 0 
                      ? [...paymentsToProcess, { amount: checkInDeposit, method: 'Efectivo', timestamp: new Date().toISOString() } as any] 
                      : paymentsToProcess;

                    handleCheckIn({ 
                      name: checkInName, 
                      documentType: checkInDocType as any, 
                      documentNumber: checkInDocNum,
                      companyName: checkInCompany,
                      companyRuc: checkInCompanyRuc,
                      expectedCheckOut: expectedCheckout.toISOString()
                    }, allPayments);
                    
                    // Reset fields
                    setStayDays(1);
                    setCheckInName('');
                    setCheckInDocType('DNI');
                    setCheckInDocNum('');
                    setCheckInCompany('');
                    setCheckInCompanyRuc('');
                    setCheckInDeposit(0);
                    setCheckInPriceReason('');
                  }}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Confirmar e Ingresar Huésped <ChevronRight size={18} />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Order Modal */}
      <AnimatePresence>
        {isOrderOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                  <ShoppingCart className="text-red-600" /> {selectedRoom ? `Venta de Productos - Hab ${selectedRoom.number}` : 'Venta Directa al Público'}
                </h3>
                <button onClick={() => { setIsOrderOpen(false); setShopCart([]); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="flex flex-col lg:flex-row max-h-[70vh]">
                {/* Catálogo de Productos */}
                <div className="flex-1 p-6 overflow-y-auto border-r border-slate-100">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">Opciones de Cobro</p>
                      <p className="text-sm text-slate-600 font-medium">¿El huésped paga ahora o se carga a la cuenta final?</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button 
                        onClick={() => setPayNow(true)}
                        className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${payNow ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        Pagar Hoy
                      </button>
                      <button 
                        onClick={() => setPayNow(false)}
                        className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!payNow ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        A la Cuenta
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.map(product => {
                      const inCart = shopCart.find(i => i.productId === product.id);
                      return (
                        <button 
                          key={product.id}
                          onClick={() => updateShopCart(product.id, 1)}
                          className={`p-4 bg-white border rounded-2xl text-left transition-all group relative overflow-hidden ${inCart ? 'border-red-600 bg-red-50/20' : 'border-slate-200 hover:border-red-400'}`}
                        >
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{product.category}</p>
                          <p className="font-bold text-slate-800 leading-tight mb-2 text-sm">{product.name}</p>
                          <div className="flex items-center justify-between">
                             <p className="font-black text-red-600">S/ {product.price.toFixed(2)}</p>
                             {inCart && (
                               <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-in zoom-in">{inCart.quantity}</span>
                             )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Carrito de Compras (Derecha) */}
                <div className="w-full lg:w-80 bg-slate-50 p-6 flex flex-col shrink-0">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumen del Pedido</h4>
                   
                   <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                      {shopCart.length === 0 ? (
                        <div className="text-center py-12 opacity-30">
                          <ShoppingCart size={32} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase">Carrito Vacío</p>
                        </div>
                      ) : (
                        shopCart.map(item => {
                          const p = products.find(prod => prod.id === item.productId)!;
                          return (
                            <div key={item.productId} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between group">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-tight">{p.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] font-black text-red-600">S/ {( (item.isCourtesy ? 0 : p.price) * item.quantity).toFixed(2)}</p>
                                  <button 
                                    onClick={() => {
                                      setShopCart(prev => prev.map(i => i.productId === item.productId && i.isCourtesy === item.isCourtesy ? { ...i, isCourtesy: !i.isCourtesy } : i));
                                    }}
                                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${item.isCourtesy ? 'bg-green-500 border-green-600 text-white' : 'border-slate-200 text-slate-400'}`}
                                  >
                                    Cortesía
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateShopCart(p.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-slate-600 hover:bg-slate-200 font-bold">-</button>
                                <span className="text-xs font-black tabular-nums">{item.quantity}</span>
                                <button onClick={() => updateShopCart(p.id, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-slate-600 hover:bg-slate-200 font-bold">+</button>
                              </div>
                            </div>
                          );
                        })
                      )}
                   </div>

                   {shopCart.length > 0 && (
                     <div className="space-y-4 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payNow ? 'Cobro Inmediato' : 'Saldar Luego'}</label>
                          {payNow && (
                            <button onClick={() => setIsSplitMode(!isSplitMode)} className="text-[9px] font-black text-red-600 uppercase border-b border-red-600">
                              {isSplitMode ? 'Volver a Único' : 'Dividir Pago'}
                            </button>
                          )}
                        </div>

                        {payNow && !isSplitMode && (
                          <div className="grid grid-cols-5 gap-1">
                            {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map(m => (
                              <button 
                                key={m}
                                onClick={() => {
                                  const total = shopCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0);
                                  handleProcessOrder(true, [{ method: m as any, amount: total }]);
                                }}
                                className="py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:border-red-600 hover:text-red-600 transition-all shadow-sm"
                              >
                                {m === 'Efectivo' ? 'Fvo' : m}
                              </button>
                            ))}
                          </div>
                        )}

                        {payNow && isSplitMode && (
                          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                             {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map(m => (
                               <div key={m} className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-slate-400 w-12">{m}</span>
                                 <input 
                                   type="number"
                                   className="flex-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-black"
                                   placeholder="0.00"
                                   onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setSplitPayments(prev => {
                                        const filtered = prev.filter(p => p.method !== m);
                                        if (val > 0) return [...filtered, { method: m as any, amount: val }];
                                        return filtered;
                                      });
                                   }}
                                 />
                               </div>
                             ))}
                             <div className="pt-2 border-t border-slate-100 flex justify-between text-[9px] font-black uppercase">
                                <span className="text-slate-400">Escrito: S/ {splitPayments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</span>
                                <span className="text-red-600">Falta: S/ {Math.max(0, shopCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0) - splitPayments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</span>
                             </div>
                          </div>
                        )}


                        <div className="bg-slate-900 rounded-2xl p-4 text-white">
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedido</p>
                                 <p className="text-xl font-black tabular-nums">S/ {shopCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0).toFixed(2)}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  const total = shopCart.reduce((acc, i) => acc + ((i.isCourtesy ? 0 : products.find(p => p.id === i.productId)!.price) * i.quantity), 0);
                                  if (!payNow) {
                                    handleProcessOrder(false, []);
                                  } else if (isSplitMode) {
                                    const paid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
                                    if (paid < total - 0.01) {
                                      alert("Monto incompleto en pago dividido.");
                                      return;
                                    }
                                    handleProcessOrder(true, splitPayments);
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${!payNow || (isSplitMode && splitPayments.length > 0) ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
                              >
                                {payNow ? (isSplitMode ? 'Confirmar Split' : 'Elija Pago ↑') : 'Añadir a Cuenta'}
                              </button>
                           </div>
                        </div>
                     </div>
                   )}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: COBRO FINAL DE CHECK-OUT */}
      <AnimatePresence>
        {isCheckoutPaymentOpen && pendingCheckoutData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  <CreditCard className="text-red-600" /> Liquidación Final
                </h3>
                <button onClick={() => setIsCheckoutPaymentOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Saldo Total Pendiente</p>
                   <p className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter">S/ {pendingCheckoutData.balance.toFixed(2)}</p>
                   <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                     Habitación {pendingCheckoutData.room.number}
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proceder con el Pago</label>
                      <button 
                        onClick={() => setIsSplitMode(!isSplitMode)} 
                        className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter transition-all ${isSplitMode ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {isSplitMode ? '✓ Cobro Combinado' : '+ Combinar Métodos'}
                      </button>
                   </div>
                   
                   {!isSplitMode ? (
                     <div className="grid grid-cols-2 gap-3">
                        {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map((m) => (
                          <button 
                            key={`pay-method-2-${m}`}
                            onClick={() => finalizeCheckout(pendingCheckoutData.roomId, pendingCheckoutData.guest, pendingCheckoutData.room, [{ amount: pendingCheckoutData.balance, method: m as any }])}
                            className="py-4 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-tighter hover:border-red-600 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-all flex flex-col items-center gap-2"
                          >
                            {m === 'Efectivo' && <Banknote size={20} />}
                            {(m === 'Visa' || m === 'Mastercard') && <CreditCard size={20} />}
                            <span>{m}</span>
                          </button>
                        ))}
                     </div>
                   ) : (
                     <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map(m => (
                          <div key={`split-pay-2-${m}`} className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 w-16 uppercase">{m}</span>
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">S/</span>
                              <input 
                                type="number" 
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-red-600"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setSplitPayments(prev => {
                                    const filtered = prev.filter(p => p.method !== m);
                                    if (val > 0) return [...filtered, { method: m as any, amount: val }];
                                    return filtered;
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] font-black uppercase">
                           <span className="text-slate-400">Restante</span>
                           <span className="text-red-600">S/ {Math.max(0, pendingCheckoutData.balance - splitPayments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</span>
                        </div>
                        
                        <button 
                          onClick={() => {
                            const paid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
                            if (paid < pendingCheckoutData.balance - 0.01) {
                              alert("Monto insuficiente para liquidar la cuenta.");
                              return;
                            }
                            // Sum up all payments into the guest history and finalize
                            // Since finalizeCheckout expects a single finalPayment for simplicity in ticket, 
                            // we loop or handle slightly differently. 
                            // For now, let's pass a special flag or just the first method for the ticket.
                            finalizeCheckout(pendingCheckoutData.roomId, pendingCheckoutData.guest, pendingCheckoutData.room, splitPayments);
                          }}
                          className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest mt-2 hover:bg-red-600 transition-colors"
                        >
                          Confirmar Cobro Dividido
                        </button>
                     </div>
                   )}
                </div>


                <button 
                  onClick={() => setIsCheckoutPaymentOpen(false)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-[10px] tracking-widest"
                >
                  Cancelar y Volver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Preview Modal */}
      <AnimatePresence>
        {isTicketOpen && currentTicket && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"
            >
              <div className="ticket-printable border-2 border-dashed border-slate-200 p-8 rounded-xl bg-orange-50/20 text-slate-800">
                <div className="text-center mb-6">
                  <Hotel className="mx-auto w-10 h-10 mb-2 text-slate-900" />
                  <h4 className="font-black text-xl uppercase italic">Suite Estrella</h4>
                  <p className="text-xs font-bold opacity-60">RUC: 20123456789</p>
                  <p className="text-xs font-bold opacity-60">Cusco, Perú</p>
                </div>
                
                <div className="border-t border-b border-slate-200 py-3 mb-4 flex justify-between text-xs font-bold uppercase">
                  <span>TICKET #{(Math.random()*1000).toFixed(0)}</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60">HUÉSPED:</span>
                    <span className="font-bold">{currentTicket.guest.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60">DOC:</span>
                    <span className="font-bold">{currentTicket.guest.documentNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60">HABITACIÓN:</span>
                    <span className="font-bold">{currentTicket.room.number} ({currentTicket.room.type})</span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-xs font-bold border-b border-slate-200 pb-1 mb-1">
                    <span>CONCEPTO</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>HOSPEDAJE BASE ({currentTicket.room.type})</span>
                    <span>S/ {currentTicket.room.price.toFixed(2)}</span>
                  </div>
                  {currentTicket.guest.orders.map((order, idx) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span>{order.quantity}x {order.name}</span>
                      <span>S/ {(order.price * order.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-slate-900 pt-3 mb-6">
                  {currentTicket.guest.paymentTiming === 'checkout' ? (
                    <div className="text-center p-4 bg-amber-100 rounded-lg">
                      <span className="font-black text-amber-900 block uppercase text-sm">Pago Pendiente</span>
                      <span className="font-bold text-amber-800 text-xs">Total: S/ {currentTicket.guest.totalExpected.toFixed(2)}</span>
                      <span className="font-bold text-amber-800 text-xs block">A realizar al finalizar estadía</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">TOTAL CUENTA</span>
                        <span className="font-black text-lg">S/ {currentTicket.guest.totalExpected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center opacity-70 text-[10px] font-bold">
                        <span>PAGADO HASTA AHORA</span>
                        <span>S/ {currentTicket.guest.payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(12)].map((_, i) => <div key={`barcode-1-${i}`} className="w-1 h-3 bg-slate-900"></div>)}
                    <div className="w-2 h-3 bg-slate-900"></div>
                    {[...Array(8)].map((_, i) => <div key={`barcode-2-${i}`} className="w-1 h-3 bg-slate-900"></div>)}
                  </div>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">¡Que disfrute su estadía!</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsTicketOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Printer size={18} /> Imprimir
                </button>
                <button 
                   onClick={() => setIsTicketOpen(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals Unified */}
      <AnimatePresence>
        {/* User Modal (Admin HUD) */}
        {isUserModalOpen && (
          <div key="modal-user" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <UserFormModal 
                user={editingUserLocal} 
                onSave={(userData) => {
                  handleSaveUser(userData as User);
                  setIsUserModalOpen(false);
                  setEditingUserLocal(null);
                }} 
                onClose={() => { setIsUserModalOpen(false); setEditingUserLocal(null); }} 
              />
            </motion.div>
          </div>
        )}

        {/* Product Modal (Tienda CRUD) */}
        {isProductModalOpen && (
          <div key="modal-product" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <ProductFormModal 
                product={editingProduct} 
                onSave={handleSaveProduct} 
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} 
              />
            </motion.div>
          </div>
        )}

        {/* Room Modal (Configuración CRUD) */}
        {isRoomModalOpen && (
          <div key="modal-room" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <RoomFormModal 
                room={editingRoom} 
                roomTypes={roomTypes}
                onSave={handleSaveRoom} 
                onClose={() => { setIsRoomModalOpen(false); setEditingRoom(null); }} 
              />
            </motion.div>
          </div>
        )}

        {/* Room Type Modal (Configuración CRUD) */}
        {isRoomTypeModalOpen && (
          <div key="modal-room-type" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <RoomTypeFormModal 
                roomType={editingRoomType} 
                onSave={handleSaveRoomType} 
                onClose={() => { setIsRoomTypeModalOpen(false); setEditingRoomType(null); }} 
              />
            </motion.div>
          </div>
        )}

        {/* Stay Summary Modal */}
        {isStaySummaryOpen && selectedRoom && (
          <div key="modal-summary" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <StaySummaryModal 
                room={selectedRoom}
                guest={guests.find(g => g.roomId === selectedRoom.id)}
                onAddOrder={() => { setIsStaySummaryOpen(false); setIsOrderOpen(true); }}
                onCheckOut={() => { setIsStaySummaryOpen(false); handleCheckOut(selectedRoom.id); }}
                onClose={() => { setIsStaySummaryOpen(false); setSelectedRoom(null); }}
              />
            </motion.div>
          </div>
        )}

        {/* Reservation Modal */}
        {isReservationModalOpen && (
          <div key="modal-reservation" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <ReservationModal 
                room={selectedRoom} 
                reservation={editingReservation}
                onSave={handleUpdateReservation} 
                onCheckIn={handleCheckInFromReservation}
                onCancel={handleCancelReservation}
                onClose={() => { setIsReservationModalOpen(false); setSelectedRoom(null); setEditingReservation(null); }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFormModal({ product, onSave, onClose }: { product: Product | null, onSave: (p: Omit<Product, 'id'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(
    product ? { ...product } : { name: '', price: 0, cost: 0, stock: 0, category: 'Bebidas' }
  );

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Catálogo de Tienda</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Nombre del Producto</label>
          <input 
            autoFocus 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
            placeholder="Ej: Agua mineral 500ml"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Precio de Venta (S/)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.price || ''}
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Costo de Compra (S/)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.cost || ''}
              onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Stock Inicial</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.stock || ''}
              onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Categoría</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold uppercase"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>Bebidas</option>
              <option>Snacks</option>
              <option>Limpieza</option>
              <option>Higiene</option>
              <option>Otros</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-8 bg-slate-50 flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
        <button 
          onClick={() => onSave(formData)}
          disabled={!formData.name}
          className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </div>
  );
}

function RoomFormModal({ room, roomTypes, onSave, onClose }: { room: Room | null, roomTypes: RoomType[], onSave: (r: Omit<Room, 'id'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Omit<Room, 'id'>>(
    room ? { ...room } : { number: '', floor: 1, type: roomTypes[0]?.name || 'Simple', price: roomTypes[0]?.basePrice || 60, status: 'available' }
  );

  const handleTypeChange = (typeName: string) => {
    const selectedType = roomTypes.find(rt => rt.name === typeName);
    if (selectedType) {
      setFormData({
        ...formData,
        type: typeName,
        price: selectedType.basePrice
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{room ? 'Editar Habitación' : 'Nueva Habitación'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuración de Inventario</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Número de Habitación</label>
            <input 
              autoFocus 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              placeholder="Ej: 101"
              value={formData.number}
              onChange={e => setFormData({...formData, number: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Piso</label>
            <input 
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.floor}
              onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Tipo de Habitación</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold uppercase"
              value={formData.type}
              onChange={e => handleTypeChange(e.target.value)}
            >
              {roomTypes.map(rt => (
                <option key={rt.id} value={rt.name}>{rt.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Precio por Noche (S/)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.price || ''}
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Estado Inicial</label>
          <select 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold uppercase"
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          >
            <option value="available">Activa / Libre</option>
            <option value="dirty">Limpieza</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="disabled">Deshabilitada</option>
          </select>
        </div>
      </div>
      <div className="p-8 bg-slate-50 flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
        <button 
          onClick={() => onSave(formData)}
          disabled={!formData.number}
          className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {room ? 'Guardar Cambios' : 'Crear Habitación'}
        </button>
      </div>
    </div>
  );
}

function RoomTypeFormModal({ roomType, onSave, onClose }: { roomType: RoomType | null, onSave: (rt: Omit<RoomType, 'id'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Omit<RoomType, 'id'>>(
    roomType ? { ...roomType } : { name: '', basePrice: 0, capacity: 1, description: '' }
  );

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{roomType ? 'Editar Tipo' : 'Nuevo Tipo de Habitación'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Categorías de Hospedaje</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Nombre de la Categoría</label>
          <input 
            autoFocus 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
            placeholder="Ej: Suite Deluxe"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Precio Base (S/)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.basePrice || ''}
              onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Capacidad (Personas)</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.capacity || ''}
              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Descripción (Opcional)</label>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-sm" 
            rows={3}
            placeholder="Detalles adicionales sobre el tipo de habitación..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>
      <div className="p-8 bg-slate-50 flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
        <button 
          onClick={() => onSave(formData)}
          disabled={!formData.name}
          className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {roomType ? 'Guardar Cambios' : 'Crear Categoría'}
        </button>
      </div>
    </div>
  );
}

function CalendarView({ rooms, reservations, onAddReservation, onEditReservation }: { rooms: Room[], reservations: Reservation[], onAddReservation: (roomId: string, date: string) => void, onEditReservation: (res: Reservation) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get days for the current week or month
  const getDaysInView = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 3); // Start 3 days before today for context
    
    for (let i = 0; i < 14; i++) { // Show 2 weeks
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysInView();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <Calendar size={18} className="text-red-600" /> Vista de Reservas
        </h3>
        <div className="flex gap-2">
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 rounded-lg transition-colors">Hoy</button>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="flex border-b border-slate-100 divide-x divide-slate-100">
            <div className="w-32 flex-shrink-0 p-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">Habitación</div>
            {days.map((day, idx) => (
              <div key={`cal-header-${idx}`} className={`flex-1 p-3 text-center ${day.toDateString() === new Date().toDateString() ? 'bg-red-50' : ''}`}>
                <p className="text-[10px] font-black uppercase text-slate-400">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                <p className={`text-lg font-black ${day.toDateString() === new Date().toDateString() ? 'text-red-600' : 'text-slate-800'}`}>{day.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {rooms.filter(r => r.status !== 'disabled').map(room => (
              <div key={room.id} className="flex divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors">
                <div className="w-32 flex-shrink-0 p-4 font-black text-slate-800 flex items-center justify-center bg-slate-50/50">
                  {room.number}
                </div>
                {days.map((day, idx) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const res = reservations.find(r => r.roomId === room.id && r.startDate <= dateStr && r.endDate >= dateStr);
                  
                  return (
                    <div 
                      key={`cal-cell-${room.id}-${idx}`} 
                      className="flex-1 min-h-[60px] p-1 relative cursor-pointer"
                      onClick={() => onAddReservation(room.id, dateStr)}
                    >
                      {res && (
                        <div 
                          className="absolute inset-0 m-1 bg-blue-600 text-white rounded-xl p-2 shadow-lg shadow-blue-900/20 flex flex-col justify-center overflow-hidden group/res"
                          onClick={(e) => { e.stopPropagation(); onEditReservation(res); }}
                        >
                          <p className="text-[9px] font-black uppercase leading-tight truncate">{res.guestName}</p>
                          {res.companyName && <p className="text-[7px] font-medium opacity-80 truncate">{res.companyName}</p>}
                          <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-white/10">
                            <p className="text-[7px] font-black opacity-50 uppercase tracking-widest leading-none">Reserva</p>
                            {res.depositAmount && res.depositAmount > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                <span className="text-[7px] font-black tabular-nums">S/ {res.depositAmount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationModal({ room, reservation, onSave, onCheckIn, onCancel, onClose }: { 
  room: Room | null, 
  reservation: Reservation | null,
  onSave: (r: Omit<Reservation, 'id'>) => void, 
  onCheckIn?: (r: Reservation) => void,
  onCancel?: (id: string) => void,
  onClose: () => void 
}) {
  const [formData, setFormData] = useState<Omit<Reservation, 'id'>>({
    roomId: room?.id || reservation?.roomId || '',
    guestName: reservation?.guestName || '',
    documentType: reservation?.documentType || 'DNI',
    documentNumber: reservation?.documentNumber || '',
    startDate: reservation?.startDate || new Date().toISOString().split('T')[0],
    endDate: reservation?.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: reservation?.status || 'confirmed',
    companyName: reservation?.companyName || '',
    companyRuc: reservation?.companyRuc || '',
    depositAmount: reservation?.depositAmount || 0,
    paymentMethod: reservation?.paymentMethod || 'Efectivo'
  });

  const [isCorporate, setIsCorporate] = useState(!!reservation?.companyName);
  const [paymentOption, setPaymentOption] = useState<'now' | 'checkout'>('now');

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{reservation ? 'Editar Reservación' : 'Nueva Reservación'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{reservation ? 'Actualizando Agenda' : 'Agenda de Estancia'}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Nombre del Huésped</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                autoFocus 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
                placeholder="Ej: Juan Perez"
                value={formData.guestName}
                onChange={e => setFormData({...formData, guestName: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Tipo Documento</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold"
              value={formData.documentType}
              onChange={e => setFormData({...formData, documentType: e.target.value as any})}
            >
              <option>DNI</option>
              <option>RUC</option>
              <option>CE</option>
              <option>Pasaporte</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">N° Documento</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              placeholder="00000000"
              value={formData.documentNumber}
              onChange={e => setFormData({...formData, documentNumber: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Fecha de Entrada</label>
            <input 
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Fecha de Salida</label>
            <input 
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <button 
            onClick={() => setIsCorporate(!isCorporate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${isCorporate ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>
              {isCorporate && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            ¿Es Reserva Corporativa?
          </button>

          {isCorporate && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Empresa (Opcional)</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
                  placeholder="Razón Social"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">RUC Empresa</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
                  placeholder="20XXXXXXXXX"
                  value={formData.companyRuc}
                  onChange={e => setFormData({...formData, companyRuc: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        {/* --- ADD PAYMENT TIMING OPTION --- */}
        <div className="border-t border-slate-100 pt-6">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Momento de Pago</label>
          <div className="flex gap-3">
             <button
               onClick={() => setPaymentOption('now')}
               className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${paymentOption === 'now' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
             >
               Pagar Ahora (Check-in)
             </button>
             <button
               onClick={() => setPaymentOption('checkout')}
               className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${paymentOption === 'checkout' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
             >
               Pagar al Checkout
             </button>
          </div>
        </div>

        {paymentOption === 'now' && (
          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase text-slate-400">Adelanto / Reserva (S/)</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold text-lg" 
                placeholder="0.00"
                value={formData.depositAmount || ''}
                onChange={e => setFormData({...formData, depositAmount: parseFloat(e.target.value) || 0})}
              />
              <div className="flex flex-wrap gap-2">
                {(['Efectivo', 'Yape', 'Plin', 'Visa'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setFormData({...formData, paymentMethod: m})}
                    className={`px-3 py-2 rounded-lg border flex-1 text-[10px] font-black uppercase transition-all ${
                      formData.paymentMethod === m 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Estado</label>
          <div className="flex gap-2">
            {(['confirmed', 'pending', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFormData({...formData, status: s})}
                className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${
                  formData.status === s 
                    ? 'border-slate-900 bg-slate-900 text-white' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                {s === 'confirmed' ? 'Confirmado' : s === 'pending' ? 'Pendiente' : 'Anulado'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-8 pb-8 bg-white flex flex-col gap-3">
        {reservation && onCheckIn && reservation.status === 'confirmed' && (
          <button 
            onClick={() => onCheckIn({ ...reservation, paymentTiming: paymentOption })}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 mb-2"
          >
            <LogIn size={20} /> Procesar Check-In ({paymentOption === 'now' ? 'Paga Ahora' : 'Paga Checkout'})
          </button>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          <button 
            onClick={() => onSave({ ...formData, paymentTiming: paymentOption })}
            disabled={!formData.guestName}
            className="flex-[2] py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            {reservation ? 'Actualizar Reserva' : 'Guardar Reserva'}
          </button>
        </div>
        {reservation && onCancel && (
          <button 
            onClick={() => onCancel(reservation.id)}
            className="w-full py-3 border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Eliminar Registro
          </button>
        )}
      </div>
    </div>
  );
}

function NavHeaderItem({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-bold text-sm transition-all tracking-tight ${
        active 
          ? 'bg-slate-100 text-red-600 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/20' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      }`}
    >
      <span className={`${active ? 'text-white' : 'group-hover:text-red-500'} transition-colors`}>
        {icon}
      </span>
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string | number, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-red-200 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="flex justify-between items-start mb-6 relative">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm ring-4 ring-slate-50 transition-all group-hover:scale-110 group-hover:shadow-md">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="relative">
        <h4 className="text-4xl font-black text-slate-900 leading-none mb-1 tracking-tighter">{value}</h4>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}

function StatusFilter({ label, count, active, color }: { label: string, count: number, active: boolean, color: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-white text-slate-800 border-slate-200 shadow-sm',
    emerald: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  };
  
  return (
    <button className={`flex items-center gap-3 px-6 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${colors[color]} ${active ? 'ring-4 ring-slate-100 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
      {label}
      <span className="bg-black/5 px-2 py-0.5 rounded text-[10px] tabular-nums">{count}</span>
    </button>
  );
}

function StaySummaryModal({ room, guest, onAddOrder, onCheckOut, onClose }: { room: Room, guest?: Guest, onAddOrder: () => void, onCheckOut: () => void, onClose: () => void }) {
  if (!guest) return null;

  const totalConsumption = guest.orders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
  const totalBalance = guest.totalExpected;
  const roomPriceSum = totalBalance - totalConsumption;

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-xl">
            {room.number}
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight uppercase tracking-tighter">Resumen de Estancia</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{room.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>

      <div className="p-6 overflow-y-auto space-y-6">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-100 shadow-sm mb-3">
              <UserIcon className="text-slate-400" size={32} />
           </div>
           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{guest.name}</h4>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{guest.documentType}:</span>
              <span className="text-[10px] font-bold text-slate-600">{guest.documentNumber}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Ingreso</p>
             <p className="text-xs font-black text-slate-900 text-center">
               {new Date(guest.checkIn).toLocaleDateString()}
               <br />
               <span className="text-[10px] opacity-60">{new Date(guest.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Salida</p>
             {guest.checkOut ? (
               <p className="text-xs font-black text-slate-900 text-center">
                 {new Date(guest.checkOut).toLocaleDateString()}
                 <br />
                 <span className="text-[10px] opacity-60">{new Date(guest.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </p>
             ) : (
               <p className="text-[10px] font-bold text-red-500 uppercase">En curso...</p>
             )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Consumo en Tienda</h4>
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {guest.orders.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 italic text-center">Sin consumos registrados</p>
            ) : (
              guest.orders.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[9px] text-slate-400">Cant: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-black text-slate-900">S/ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
           <div className="flex justify-between items-center text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
              <span>Hospedaje Total</span>
              <span>S/ {roomPriceSum.toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center text-xs font-bold text-red-600 uppercase tracking-widest mb-4">
              <span>Extras/Tienda</span>
              <span>S/ {totalConsumption.toFixed(2)}</span>
           </div>
           <div className="h-px bg-red-200 mb-4 opacity-50"></div>
           <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">Saldo Total</span>
              <span className="text-2xl font-black text-red-900">S/ {totalBalance.toFixed(2)}</span>
           </div>
        </div>
      </div>

      <div className="p-6 bg-slate-100 flex gap-3">
        <button 
          onClick={onAddOrder}
          className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} /> Pedido
        </button>
        <button 
          onClick={onCheckOut}
          className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Check-out
        </button>
      </div>
    </div>
  );
}

interface RoomCardProps {
  key?: string | number;
  room: Room;
  guestName?: string;
  onCheckIn: () => void;
  onShowSummary: () => void;
  onAddOrder: () => void;
  onCheckOut: () => void;
  onReady: (id: string) => void;
  paymentTiming?: 'now' | 'checkout';
}

function RoomCard({ room, guestName, onCheckIn, onShowSummary, onAddOrder, onCheckOut, onReady, paymentTiming }: RoomCardProps) {
  const statusStyles: Record<RoomStatus, any> = {
    available: { 
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-emerald-500 hover:shadow-emerald-500/10',
      labelBg: 'bg-emerald-50 text-emerald-600',
      tag: 'Libre',
      icon: <Bed className="text-emerald-500" size={20} />
    },
    occupied: { 
      bg: 'bg-slate-900 text-white',
      border: 'border-slate-900 shadow-xl shadow-slate-900/20',
      labelBg: 'bg-red-600 text-white',
      tag: 'Ocupado',
      icon: <UserIcon className="text-white" size={20} />
    },
    dirty: { 
      bg: 'bg-orange-50',
      border: 'border-orange-200 hover:border-orange-500',
      labelBg: 'bg-orange-100 text-orange-700',
      tag: 'Limpieza',
      icon: <Trash2 className="text-orange-500" size={20} />
    },
    maintenance: { 
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      labelBg: 'bg-slate-200 text-slate-600',
      tag: 'Mtto.',
      icon: <Settings className="text-slate-400" size={20} />
    },
    disabled: { 
      bg: 'bg-slate-100 opacity-50',
      border: 'border-slate-200',
      labelBg: 'bg-slate-300 text-slate-500',
      tag: 'Inactiva',
      icon: <ShieldAlert className="text-slate-400" size={20} />
    }
  };

  const style = statusStyles[room.status];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={room.status === 'occupied' ? onShowSummary : room.status === 'available' ? onCheckIn : undefined}
      className={`group relative ${style.bg} rounded-3xl border-2 transition-all duration-500 ${style.border} flex flex-col p-6 h-full shadow-sm cursor-pointer overflow-hidden`}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-3xl font-black tracking-tighter leading-none">{room.number}</h4>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${style.labelBg}`}>
              {style.tag}
            </div>
            {paymentTiming === 'checkout' && (
              <div className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white">
                Pagar Checkout
              </div>
            )}
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40`}>{room.type}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-black/5 bg-white`}>
          {style.icon}
        </div>
      </div>

      <div className="flex-1 relative z-10">
        {room.status === 'occupied' ? (
          <div className="space-y-3">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Huésped</p>
               <p className="text-sm font-black truncate leading-tight">{guestName}</p>
            </div>
            {paymentTiming === 'checkout' && (
              <div className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <p className="text-[9px] font-black uppercase text-amber-100 italic">Pago al checkout</p>
              </div>
            )}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase text-red-500">Activo</span>
               </div>
               <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-red-600"></motion.div>
               </div>
            </div>
          </div>
        ) : room.status === 'available' ? (
          <div className="flex flex-col gap-1">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tarifa</p>
             <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold opacity-30">S/</span>
                <span className="text-xl font-black text-slate-800">{room.price}</span>
             </div>
          </div>
        ) : room.status === 'dirty' ? (
          <div className="py-2">
            <div className="flex items-center gap-2 mb-2">
               <Clock size={12} className="text-orange-500" />
               <span className="text-[9px] font-black uppercase text-orange-600">Pendiente de Aseo</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onReady(room.id); }}
              className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-shadow shadow-lg shadow-orange-500/20 active:scale-95 transform"
            >
              Confirmar Listo
            </button>
          </div>
        ) : (
           <div className="h-10"></div>
        )}
      </div>

      {/* Decorative Icon */}
      <div className={`absolute bottom-0 right-0 -mb-6 -mr-6 transition-all duration-500 opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-125 transform`}>
        {React.cloneElement(style.icon, { size: 100 })}
      </div>
    </motion.div>
  );
}

function LoginPortal({ hotelInfo, users, onLogin }: { hotelInfo: HotelInfo, users: User[], onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      setError('Credenciales incorrectas');
      return;
    }
    
    setError('');
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[100] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-red-600 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[160px] animate-pulse delay-700"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-600/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/30 transform -rotate-6">
               <Star className="text-white fill-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">{hotelInfo.name.split(' ')[0]} <span className="text-red-500">{hotelInfo.name.split(' ').slice(1).join(' ')}</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[9px]">{hotelInfo.name}</p>
          </div>

          <form onSubmit={handleAccess} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 font-bold text-[10px] uppercase tracking-widest">
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Usuario</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-red-600 focus:bg-white/10 transition-all placeholder:text-slate-600"
                  placeholder="ID de Acceso"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Contraseña</label>
              <div className="relative">
                <ShieldAlert className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-red-600 focus:bg-white/10 transition-all placeholder:text-slate-600 tracking-[0.5em]"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-red-600/20 hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
              Acceder al Sistema
            </button>
          </form>

          <p className="mt-12 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Encriptación de Grado Bancario Activa
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function UserFormModal({ user, onSave, onClose }: { user: User | null, onSave: (u: Partial<User>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Partial<User>>(
    user ? { ...user } : { name: '', username: '', password: '', role: 'recepcionist' }
  );

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{user ? 'Editar Personal' : 'Nuevo Personal'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión de Accesos</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Nombre Completo del Personal</label>
          <input 
            autoFocus 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold" 
            placeholder="Ej: Juan Pérez"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Usuario (Login)</label>
            <input 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold" 
              placeholder="juanp"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Contraseña</label>
            <input 
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Teléfono de Contacto</label>
          <input 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold" 
            placeholder="Ej: 987654321"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Rol del Usuario</label>
          <select 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold uppercase"
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value as any})}
          >
            <option value="recepcionist">Recepcionista</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="pt-4">
          <button 
            onClick={() => onSave({ ...formData, id: user?.id || Math.random().toString(36).substr(2, 9) })}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all"
          >
            {user ? 'Guardar Cambios' : 'Registrar Personal'}
          </button>
        </div>
      </div>
    </div>
  );
}
