import React, { useState, useMemo } from 'react';
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
  User,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, RoomStatus, Guest, Product, SaleRecord, OrderItem, Payment, Reservation } from './types';

// Initial Mock Data
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
  { id: 'u1', name: 'Administrador', role: 'admin', username: 'admin' },
  { id: 'u2', name: 'Karla Gomez', role: 'recepcionist', username: 'karla', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 'u3', name: 'Diego Torres', role: 'recepcionist', username: 'diego', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
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

  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'shop' | 'reports' | 'config'>('rooms');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<SaleRecord[]>([]);
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
  const [checkInCart, setCheckInCart] = useState<{productId: string, quantity: number}[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [reportDateRange, setReportDateRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [isShiftFilterActive, setIsShiftFilterActive] = useState(false);

  // Stats
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
    
    return { occupied, available, dirty, totalRevenue, estimatedProfit, filteredSales, shiftRevenue, shiftSales };
  }, [rooms, sales, reportDateRange, currentShift]);

  // Handlers
  const handleCheckIn = (guestData: Partial<Guest>, finalPayments: {method: Payment['method'], amount: number}[]) => {
    if (!selectedRoom) return;

    const cartItems = checkInCart.map(item => {
      const p = products.find(prod => prod.id === item.productId)!;
      return { ...item, product: p };
    });

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const roomPrice = selectedRoom.price;
    const totalToPay = roomPrice + cartTotal;

    const guestOrders: OrderItem[] = cartItems.map(item => ({
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      cost: item.product.cost,
      timestamp: new Date().toISOString()
    }));

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
      orders: guestOrders,
      payments: paymentRecords,
      totalExpected: totalToPay
    };

    setGuests([...guests, newGuest]);
    setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, status: 'occupied', currentGuestId: newGuest.id } : r));
    
    // Register sales for each payment method used
    const newSales: SaleRecord[] = finalPayments.map(p => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      guestName: newGuest.name,
      roomNumber: selectedRoom.number,
      amount: p.amount,
      method: p.method,
      type: 'Hospedaje'
    }));

    setSales([...sales, ...newSales]);
    
    // Update shift sales
    newSales.forEach(s => updateShiftSales(s.amount));

    setCurrentTicket({ guest: newGuest, room: selectedRoom });
    setIsCheckInOpen(false);
    setCheckInCart([]);
    setSplitPayments([]);
    setIsSplitMode(false);
    setIsTicketOpen(true);
  };

  const updateCheckInCart = (productId: string, delta: number) => {
    setCheckInCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.productId !== productId);
        return prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { productId, quantity: delta }];
      return prev;
    });
  };

  const [isCheckoutPaymentOpen, setIsCheckoutPaymentOpen] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<{roomId: string, guest: Guest, room: Room, balance: number} | null>(null);
  const [shopCart, setShopCart] = useState<{productId: string, quantity: number}[]>([]);
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

  const handleUpdateReservation = (resData: Omit<Reservation, 'id'>) => {
    if (editingReservation) {
      setReservations(reservations.map(r => r.id === editingReservation.id ? { ...resData, id: r.id } : r));
    } else {
      const newRes: Reservation = {
        ...resData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setReservations([...reservations, newRes]);
    }
    setIsReservationModalOpen(false);
    setEditingReservation(null);
  };

  const handleCancelReservation = (id: string) => {
    if (confirm('¿Desea anular esta reserva?')) {
      setReservations(reservations.filter(r => r.id !== id));
      setIsReservationModalOpen(false);
      setEditingReservation(null);
    }
  };

  const handleProcessOrder = (payNow: boolean, finalPayments: {method: Payment['method'], amount: number}[]) => {
    if (!selectedRoom || !selectedRoom.currentGuestId || shopCart.length === 0) return;

    const guest = guests.find(g => g.id === selectedRoom.currentGuestId);
    if (!guest) return;

    const newOrderItems: OrderItem[] = shopCart.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
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

    const updatedGuest = {
      ...guest,
      orders: [...guest.orders, ...newOrderItems],
      payments: [...guest.payments, ...paymentRecords],
      totalExpected: payNow ? guest.totalExpected : guest.totalExpected + totalAmount
    };

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
      setSales([...sales, ...newSales]);
      newSales.forEach(s => updateShiftSales(s.amount));
      
      setCurrentTicket({ 
        guest: { ...updatedGuest, orders: newOrderItems, payments: paymentRecords }, 
        room: selectedRoom 
      });
      setIsTicketOpen(true);
    }

    setIsOrderOpen(false);
    setShopCart([]);
    setSplitPayments([]);
    setIsSplitMode(false);
  };

  const updateShopCart = (productId: string, delta: number) => {
    setShopCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.productId !== productId);
        return prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { productId, quantity: delta }];
      return prev;
    });
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: p.id } : p));
    } else {
      const newProduct: Product = {
        ...productData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };
  
  const handleSaveRoom = (roomData: Omit<Room, 'id'>) => {
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...roomData, id: r.id } : r));
    } else {
      const newRoom: Room = {
        ...roomData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setRooms([...rooms, newRoom]);
    }
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleToggleRoomStatus = (roomId: string) => {
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, status: r.status === 'disabled' ? 'available' : 'disabled' };
      }
      return r;
    }));
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('¿Está seguro de eliminar esta habitación?')) {
      setRooms(rooms.filter(r => r.id !== roomId));
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

  const finalizeCheckout = (roomId: string, guest: Guest, room: Room, finalPayments: { amount: number, method: Payment['method'] }[] = []) => {
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

    setSales([...sales, ...newSales]);
    newSales.forEach(s => updateShiftSales(s.amount));
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
  };

  const handleLogout = () => {
    if (confirm('¿Desea cerrar el turno actual?')) {
      setCurrentUser(null);
      setCurrentShift(null);
    }
  };

  if (!currentUser) {
    return <LoginPortal onLogin={(user, cash) => {
      setCurrentUser(user);
      setCurrentShift({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        startTime: new Date().toISOString(),
        startingCash: cash,
        totalSales: 0
      });
    }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-800">
      {/* Header Navigation */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-900/20 transform hover:scale-110 transition-transform">H</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">InkaHotel <span className="text-red-600">Cloud</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Hospitality Elite v2.4</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <NavHeaderItem active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} label="Recepción" />
          <NavHeaderItem active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} label="Market" />
          <NavHeaderItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Auditoría" />
          <NavHeaderItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} label="Sistemas" />
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
            onClick={handleLogout}
            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all group"
            title="Cerrar Turno"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Optional in Theme but kept for your existing functionality, styled to theme) */}
        <nav className="w-16 lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 lg:hidden">
          {/* Mobile version of sidebar icons if needed */}
        </nav>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'rooms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="rooms">
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
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="shop" className="space-y-6">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Gestión de Catálogo</h2>
                      <p className="text-sm text-slate-500">Configure productos, precios, costos y stock.</p>
                   </div>
                   <button 
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                   >
                     <Plus size={20} /> Nuevo Producto
                   </button>
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
                              <User size={32} className="text-white" />
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
                      <h3 className="font-bold text-xl text-slate-800 uppercase tracking-tighter">Reporte de Ventas & Análisis</h3>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="config" className="space-y-8">
                <div className="flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Gestión de Habitaciones</h2>
                      <p className="text-sm text-slate-500">Configure pisos, precios y estados de las habitaciones.</p>
                   </div>
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
                <button onClick={() => { setIsCheckInOpen(false); setCheckInCart([]); }} className="text-slate-400 hover:text-slate-600"><X /></button>
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
                      <input id="guest-name" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" placeholder="Apellidos y Nombres" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Doc.</label>
                      <select id="guest-doc-type" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold">
                        <option>DNI</option>
                        <option>RUC</option>
                        <option>CE</option>
                        <option>Pasaporte</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">N° Documento</label>
                      <input id="guest-doc-num" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none font-bold" placeholder="Documento" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Método de Pago Principal</label>
                      <button 
                        onClick={() => setIsSplitMode(!isSplitMode)} 
                        className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${isSplitMode ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {isSplitMode ? '✓ Pago Combinado' : '+ Combinar Métodos'}
                      </button>
                    </div>
                    
                    {!isSplitMode ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {['Efectivo', 'Yape', 'Plin', 'Visa', 'Mastercard'].map(m => (
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
                                S/ {Math.max(0, ((selectedRoom?.price || 0) + checkInCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0)) - splitPayments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}
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
                              <>
                                <button onClick={() => updateCheckInCart(product.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold">-</button>
                                <span className="text-sm font-black w-4 text-center tabular-nums">{inCart.quantity}</span>
                                <button onClick={() => updateCheckInCart(product.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 font-bold">+</button>
                              </>
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
                        <span>Hospedaje</span>
                        <span>S/ {selectedRoom?.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Venta Adicional</span>
                        <span>S/ {checkInCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total a Cobrar</p>
                        <p className="text-3xl font-black tabular-nums">
                          S/ {((selectedRoom?.price || 0) + checkInCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0)).toFixed(2)}
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
                <button type="button" onClick={() => { setIsCheckInOpen(false); setCheckInCart([]); setSplitPayments([]); setIsSplitMode(false); }} className="flex-1 py-4 border-2 border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                <button 
                  type="button" 
                  onClick={() => {
                    const guestName = (document.getElementById('guest-name') as HTMLInputElement)?.value;
                    const docType = (document.getElementById('guest-doc-type') as HTMLSelectElement)?.value;
                    const docNum = (document.getElementById('guest-doc-num') as HTMLInputElement)?.value;
                    
                    if (!guestName || !docNum) {
                      alert("Por favor complete los datos del huésped.");
                      return;
                    }

                    const totalToPay = (selectedRoom?.price || 0) + checkInCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0);
                    const paymentsToProcess = isSplitMode ? splitPayments : [{ method: paymentMethod, amount: totalToPay }];
                    const paidAmount = paymentsToProcess.reduce((acc, p) => acc + p.amount, 0);

                    if (paidAmount < totalToPay - 0.01) {
                      alert(`Monto insuficiente. Faltan S/ ${(totalToPay - paidAmount).toFixed(2)}`);
                      return;
                    }

                    handleCheckIn({ name: guestName, documentType: docType as any, documentNumber: docNum }, paymentsToProcess);
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
                  <ShoppingCart className="text-red-600" /> Venta de Productos - Hab {selectedRoom?.number}
                </h3>
                <button onClick={() => { setIsOrderOpen(false); setShopCart([]); }} className="text-slate-400 hover:text-slate-600"><X /></button>
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
                                <p className="text-[10px] font-black text-red-600">S/ {(p.price * item.quantity).toFixed(2)}</p>
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
                                  const total = shopCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0);
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
                                <span className="text-red-600">Falta: S/ {Math.max(0, shopCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0) - splitPayments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</span>
                             </div>
                          </div>
                        )}


                        <div className="bg-slate-900 rounded-2xl p-4 text-white">
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedido</p>
                                 <p className="text-xl font-black tabular-nums">S/ {shopCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0).toFixed(2)}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  const total = shopCart.reduce((acc, i) => acc + (products.find(p => p.id === i.productId)!.price * i.quantity), 0);
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
                  <h4 className="font-black text-xl uppercase italic">IncaHotel</h4>
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
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">TOTAL CUENTA</span>
                    <span className="font-black text-lg">S/ {currentTicket.guest.totalExpected.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-70 text-[10px] font-bold">
                    <span>PAGADO HASTA AHORA</span>
                    <span>S/ {currentTicket.guest.payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</span>
                  </div>
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
                onSave={handleSaveRoom} 
                onClose={() => { setIsRoomModalOpen(false); setEditingRoom(null); }} 
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

function RoomFormModal({ room, onSave, onClose }: { room: Room | null, onSave: (r: Omit<Room, 'id'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Omit<Room, 'id'>>(
    room ? { ...room } : { number: '', floor: 1, type: 'Simple', price: 60, status: 'available' }
  );

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
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option>Simple</option>
              <option>Doble</option>
              <option>Matrimonial</option>
              <option>Triple</option>
              <option>Suite</option>
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

function CalendarView({ rooms, reservations, onAddReservation }: { rooms: Room[], reservations: Reservation[], onAddReservation: (roomId: string, date: string) => void }) {
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
                        <div className="absolute inset-0 m-1 bg-blue-500 text-white rounded-lg p-1.5 shadow-sm flex flex-col justify-center overflow-hidden">
                          <p className="text-[8px] font-black uppercase leading-none opacity-80 mb-0.5 truncate">{res.guestName}</p>
                          <p className="text-[7px] font-bold opacity-60 truncate">RESERVA</p>
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

function ReservationModal({ room, reservation, onSave, onCancel, onClose }: { 
  room: Room | null, 
  reservation: Reservation | null,
  onSave: (r: Omit<Reservation, 'id'>) => void, 
  onCancel?: (id: string) => void,
  onClose: () => void 
}) {
  const [formData, setFormData] = useState<Omit<Reservation, 'id'>>({
    roomId: room?.id || reservation?.roomId || '',
    guestName: reservation?.guestName || '',
    startDate: reservation?.startDate || new Date().toISOString().split('T')[0],
    endDate: reservation?.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: reservation?.status || 'confirmed'
  });

  return (
    <div className="flex flex-col">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
           <h3 className="font-black text-xl uppercase tracking-tighter">{reservation ? 'Editar Reservación' : 'Nueva Reservación'}</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{reservation ? 'Actualizando Agenda' : 'Agenda de Estancia'}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Nombre del Huésped</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              autoFocus 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold" 
              placeholder="Ej: Juan Perez"
              value={formData.guestName}
              onChange={e => setFormData({...formData, guestName: e.target.value})}
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
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          <button 
            onClick={() => onSave(formData)}
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
  const roomPrice = room.price; // Simplified for demo
  const totalBalance = roomPrice + totalConsumption;

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
              <User className="text-slate-400" size={32} />
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
              <span>Hospedaje</span>
              <span>S/ {roomPrice.toFixed(2)}</span>
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
}

function RoomCard({ room, guestName, onCheckIn, onShowSummary, onAddOrder, onCheckOut, onReady }: RoomCardProps) {
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
      icon: <User className="text-white" size={20} />
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

function LoginPortal({ onLogin }: { onLogin: (user: User, cash: number) => void }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passcode, setPasscode] = useState('');
  const [startingCash, setStartingCash] = useState('0');
  const [view, setView] = useState<'users' | 'access'>('users');

  const handleAccess = () => {
    if (selectedUser) {
      if (passcode.length < 4) {
        alert("Ingrese su PIN de 4 dígitos");
        return;
      }
      onLogin(selectedUser, parseFloat(startingCash) || 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[100] overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-red-600 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[160px] animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] relative z-10 border border-white/10 backdrop-blur-3xl"
      >
        {/* Left Side: Branding */}
        <div className="w-full md:w-5/12 bg-slate-900 p-16 flex flex-col justify-between text-white relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-indigo-600/20"></div>
           
           <div className="relative z-10">
              <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-4xl font-black mb-10 shadow-2xl shadow-red-600/40 transform -rotate-6 hover:rotate-0 transition-transform">H</div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-tight">InkaHotel<br /><span className="text-red-500 underline decoration-8 underline-offset-[12px]">Cloud</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-12 bg-white/5 inline-block px-4 py-2 rounded-full">Elite Hospitality v2.4.0</p>
           </div>
           
           <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ShieldAlert className="text-red-500" size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Node</p>
                      <p className="text-sm font-bold">AES-256 Protocol Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Clock className="text-indigo-400" size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Uptime</p>
                      <p className="text-sm font-bold">99.98% Network Status</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em]">INKAHOTEL GLOBAL SYSTEMS GROUP</p>
           </div>
        </div>

        {/* Right Side: Login Content */}
        <div className="w-full md:w-7/12 p-12 md:p-20 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {view === 'users' ? (
              <motion.div 
                key="users-view"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-10"
              >
                <div>
                   <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Acceso de Estancia</h2>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bienvenido al sistema. Seleccione su perfil para continuar.</p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {INITIAL_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setView('access');
                      }}
                      className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-red-600 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-red-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                      
                      <div className="w-20 h-20 bg-slate-200 rounded-3xl overflow-hidden border-4 border-white flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} />
                        )}
                      </div>
                      <div className="text-left flex-1 relative z-10">
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-red-600 transition-colors uppercase italic">{user.name}</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">{user.role === 'admin' ? 'Supervisión / ADM' : 'Operaciones / Recepción'}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:text-red-600 group-hover:bg-red-50 transition-all relative z-10">
                         <ChevronRight size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="access-view"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <button onClick={() => setView('users')} className="w-14 h-14 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all flex items-center justify-center text-slate-400">
                    <ChevronLeft size={28} />
                  </button>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">{selectedUser?.name}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">Configuración de sesión de turno</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">Saldo Inicial de Caja</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                         <span className="text-slate-400 font-black text-xl">S/</span>
                      </div>
                      <input 
                        type="number"
                        autoFocus
                        className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-3xl font-black text-slate-900 focus:border-red-600 bg-white shadow-inner outline-none transition-all"
                        placeholder="0.00"
                        value={startingCash}
                        onChange={e => setStartingCash(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4">PIN de Seguridad (4 dígitos)</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                         <Clock className="text-slate-400" size={24} />
                      </div>
                      <input 
                        type="password"
                        maxLength={4}
                        className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-3xl font-black text-slate-900 focus:border-red-600 bg-white shadow-inner outline-none tracking-[1em] transition-all"
                        placeholder="••••"
                        value={passcode}
                        onChange={e => setPasscode(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAccess}
                    className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] shadow-2xl shadow-slate-900/30 hover:bg-red-600 hover:shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                  >
                    Iniciar Operaciones
                  </button>
                  
                  <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest px-10">Acceso restringido a personal autorizado. Todas las actividades son grabadas.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
