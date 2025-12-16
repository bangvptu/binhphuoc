import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CarFront, 
  Map, 
  Settings, 
  Menu, 
  Bell, 
  Search,
  PlusCircle,
  Users as UsersIcon,
  FileBarChart,
  UserPlus,
  Bus,
  QrCode,
  MapPin,
  ArrowRight,
  ArrowUpDown
} from 'lucide-react';

import { MOCK_VEHICLES, MOCK_BOOKINGS, CURRENT_USER, MOCK_DRIVERS, MOCK_SHUTTLE_BOOKINGS } from './constants';
import { Vehicle, Booking, BookingStatus, Driver, NotificationItem, ShuttleBooking, ShuttleStatus } from './types';
import Dashboard from './components/Dashboard';
import VehicleCard from './components/VehicleCard';
import BookingModal from './components/BookingModal';
import GuestBookingModal from './components/GuestBookingModal';
import DriverList from './components/DriverList';
import NotificationToast from './components/NotificationToast';
import ShuttleManager from './components/ShuttleManager';
import ShuttleBookingModal from './components/ShuttleBookingModal';
import ShareLinkModal from './components/ShareLinkModal';
import PublicGuestForm from './components/PublicGuestForm';
import BookingDetailsModal from './components/BookingDetailsModal';

enum View {
  DASHBOARD = 'Dashboard',
  VEHICLES = 'Vehicles',
  DRIVERS = 'Drivers',
  TRIPS = 'Trips',
  SHUTTLE = 'Shuttle',
  REPORTS = 'Reports',
  SETTINGS = 'Settings'
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [drivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [shuttleBookings, setShuttleBookings] = useState<ShuttleBooking[]>(MOCK_SHUTTLE_BOOKINGS);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isShuttleModalOpen, setIsShuttleModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPublicFormOpen, setIsPublicFormOpen] = useState(false);
  
  // Sorting State
  const [sortOption, setSortOption] = useState<'default' | 'seats-asc' | 'seats-desc'>('default');

  // State for Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Helper to sort vehicles
  const getSortedVehicles = () => {
    let sorted = [...vehicles];
    if (sortOption === 'seats-asc') {
      sorted.sort((a, b) => a.seats - b.seats);
    } else if (sortOption === 'seats-desc') {
      sorted.sort((a, b) => b.seats - a.seats);
    }
    return sorted;
  };

  // New Internal Booking Handler
  const handleCreateBooking = (data: any) => {
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      vehicleId: data.vehicleId,
      driverId: data.driverId || undefined,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      purpose: data.purpose,
      destination: data.destination,
      stops: data.stops || [data.destination], // Include stops array
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
      estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : 0
    };
    setBookings([newBooking, ...bookings]);
    addNotification("Đã tạo yêu cầu đặt xe thành công!", "success");
  };

  // New Guest Booking Handler
  const handleCreateGuestBooking = (data: any) => {
    const newBooking: Booking = {
      id: `g${Date.now()}`,
      isGuest: true,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      pickupLocation: data.pickupLocation,
      vehicleTypeRequirement: data.vehicleType,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      purpose: 'Khách vãng lai',
      destination: data.destination,
      stops: [data.destination],
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
      estimatedCost: data.estimatedCost || 0
    };
    setBookings([newBooking, ...bookings]);
    addNotification(`Đã tạo yêu cầu cho khách ${data.guestName}!`, "success");
  };

  // Shuttle Booking Handler
  const handleCreateShuttleBooking = (data: any) => {
     const newBooking: ShuttleBooking = {
       id: `s${Date.now()}`,
       guestName: data.guestName,
       guestPhone: data.guestPhone,
       pickupLocation: data.pickupLocation,
       date: data.date,
       timeSlot: data.timeSlot,
       paxCount: data.paxCount,
       status: ShuttleStatus.REGISTERED,
       bookingTime: new Date().toISOString(),
       isVIP: false
     };
     setShuttleBookings([...shuttleBookings, newBooking]);
     addNotification(`Đã đặt ${data.paxCount} ghế cho ${data.guestName} lúc ${data.timeSlot}`, "success");
  };

  const handleUpdateShuttleStatus = (id: string, status: ShuttleStatus) => {
     setShuttleBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
     addNotification("Đã cập nhật trạng thái khách ghép", "info");
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
        activeView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-inter relative">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast 
              {...notification} 
              onClose={removeNotification} 
            />
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 
          transform transition-transform duration-300 lg:transform-none p-6 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            VF
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">VinFleet</h1>
            <span className="text-xs text-slate-400 font-medium">Hà Nội Operations</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quản lý</p>
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Tổng quan" />
            <NavItem view={View.TRIPS} icon={Map} label="Điều phối chuyến" />
            <NavItem view={View.SHUTTLE} icon={Bus} label="Xe ghép / Shuttle" />
          </div>
          
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tài nguyên</p>
            <NavItem view={View.VEHICLES} icon={CarFront} label="Đội xe" />
            <NavItem view={View.DRIVERS} icon={UsersIcon} label="Tài xế" />
          </div>

          <div>
             <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hệ thống</p>
             <NavItem view={View.REPORTS} icon={FileBarChart} label="Báo cáo" />
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <NavItem view={View.SETTINGS} icon={Settings} label="Cài đặt" />
           <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
             <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
               {CURRENT_USER.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-900 truncate">{CURRENT_USER.name}</p>
               <p className="text-xs text-slate-500 truncate">{CURRENT_USER.role} • {CURRENT_USER.department}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 px-6 lg:px-10 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {activeView === View.DASHBOARD && 'Bảng điều khiển'}
              {activeView === View.VEHICLES && 'Danh sách xe'}
              {activeView === View.DRIVERS && 'Danh sách tài xế'}
              {activeView === View.TRIPS && 'Điều phối & Lịch trình'}
              {activeView === View.SHUTTLE && 'Xe ghép theo giờ'}
              {activeView === View.REPORTS && 'Báo cáo doanh thu'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
            
            {/* Context Aware Buttons */}
            {activeView === View.SHUTTLE ? (
              <div className="flex gap-2">
                 <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  title="Lấy Link đăng ký"
                >
                  <QrCode size={18} />
                  <span className="hidden sm:inline">QR Đặt xe</span>
                </button>
                 <button 
                  onClick={() => setIsShuttleModalOpen(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-200 transition-all active:scale-95"
                >
                  <PlusCircle size={18} />
                  <span className="hidden sm:inline">Thêm khách</span>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsGuestModalOpen(true)}
                  className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-orange-200 active:scale-95"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Khách vãng lai</span>
                </button>

                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle size={18} />
                  <span className="hidden sm:inline">Tạo chuyến mới</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
          <div className="max-w-8xl mx-auto">
            {activeView === View.DASHBOARD && (
              <Dashboard vehicles={vehicles} bookings={bookings} drivers={drivers} />
            )}

            {activeView === View.VEHICLES && (
              <div className="space-y-4 animate-fadeIn">
                 <div className="flex justify-end">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                       <ArrowUpDown size={16} className="text-slate-400" />
                       <span className="text-sm font-medium text-slate-500">Sắp xếp:</span>
                       <select 
                          className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value as any)}
                       >
                          <option value="default">Mặc định</option>
                          <option value="seats-asc">Số ghế (Tăng dần)</option>
                          <option value="seats-desc">Số ghế (Giảm dần)</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {getSortedVehicles().map(v => (
                    <VehicleCard 
                      key={v.id} 
                      vehicle={v} 
                      onBook={() => setIsBookingModalOpen(true)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {activeView === View.DRIVERS && (
              <DriverList drivers={drivers} />
            )}

            {activeView === View.TRIPS && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-200px)]">
                 <div className="p-4 border-b border-slate-100 flex gap-2">
                    <button className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Tất cả</button>
                    <button className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50">Chờ duyệt</button>
                    <button className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50">Đang chạy</button>
                 </div>
                <div className="overflow-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-6 py-4">Mã chuyến / Người tạo</th>
                        <th className="px-6 py-4">Lộ trình</th>
                        <th className="px-6 py-4">Tài sản & Nhân sự</th>
                        <th className="px-6 py-4">Tài chính</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map(booking => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        const driver = drivers.find(d => d.id === booking.driverId);
                        
                        // Check for multiple stops
                        const hasStops = booking.stops && booking.stops.length > 1;

                        return (
                          <tr 
                            key={booking.id} 
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-white hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-100 last:border-0"
                          >
                            <td className="px-6 py-4">
                              <span className={`font-mono text-xs uppercase px-1.5 py-0.5 rounded ${booking.isGuest ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                                #{booking.id} {booking.isGuest && '• GUEST'}
                              </span>
                              {booking.isGuest ? (
                                <div className="mt-1">
                                    <p className="font-bold text-orange-700">{booking.guestName}</p>
                                    <p className="text-xs text-orange-600/70">{booking.guestPhone}</p>
                                </div>
                              ) : (
                                <div className="mt-1">
                                    <p className="font-bold text-slate-900">{booking.userName}</p>
                                    <p className="text-xs text-slate-500">Nội bộ</p>
                                </div>
                              )}
                              <p className="text-xs text-slate-400 mt-1">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-start gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0"></div>
                                    <span className="text-xs text-slate-500">{booking.pickupLocation || 'Trụ sở chính'}</span>
                                </div>
                                
                                {hasStops ? (
                                    <div className="pl-0.5">
                                        {booking.stops?.slice(0, -1).map((stop, idx) => (
                                             <div key={idx} className="flex items-center gap-1 my-0.5">
                                                <div className="w-0.5 h-2 bg-slate-200 ml-0.5"></div>
                                                <span className="text-xs text-slate-400 truncate max-w-[150px]">{stop}</span>
                                             </div>
                                        ))}
                                        <div className="flex items-start gap-1 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                            <span className="font-semibold text-slate-800">{booking.destination}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                        <span className="font-semibold text-slate-800">{booking.destination}</span>
                                    </div>
                                )}

                                <span className="text-xs text-slate-500 truncate max-w-[200px] mt-1 italic">{booking.purpose}</span>
                                <span className="text-xs text-slate-400">
                                   {new Date(booking.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                 {booking.vehicleId ? (
                                     <div className="text-slate-800 font-medium">{vehicle?.name} <span className="text-slate-400 text-xs">({vehicle?.plate})</span></div>
                                 ) : (
                                     <div className="text-orange-600 font-medium text-xs">Yêu cầu: {booking.vehicleTypeRequirement}</div>
                                 )}
                                 
                                 <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <UsersIcon size={12}/> {driver ? driver.name : <span className="text-amber-500 italic">Chưa chỉ định</span>}
                                 </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               {booking.actualRevenue ? (
                                   <div className="text-emerald-600 font-bold">
                                       +{new Intl.NumberFormat('vi-VN').format(booking.actualRevenue)}
                                   </div>
                               ) : (
                                   <div className="text-slate-400 italic">
                                       Est: {new Intl.NumberFormat('vi-VN').format(booking.estimatedCost)}
                                   </div>
                               )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.ASSIGNED ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  booking.status === BookingStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' : 
                                  booking.status === BookingStatus.WAITING_FOR_DRIVER ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  booking.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}
                              `}>
                                {booking.status === BookingStatus.APPROVED ? 'Đã duyệt' : booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedBooking(booking);
                                 }}
                                 className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                               >
                                 Chi tiết
                               </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeView === View.SHUTTLE && (
              <ShuttleManager 
                bookings={shuttleBookings} 
                drivers={drivers}
                vehicles={vehicles}
                onUpdateStatus={handleUpdateShuttleStatus} 
              />
            )}

            {(activeView === View.SETTINGS || activeView === View.REPORTS) && (
               <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                 <Settings size={48} className="mb-4 opacity-50" />
                 <h3 className="text-lg font-medium text-slate-600">Module đang phát triển</h3>
                 <p>Tính năng này sẽ sớm được cập nhật trong phiên bản tiếp theo.</p>
               </div>
            )}
          </div>
        </div>

        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)}
          vehicles={vehicles}
          drivers={drivers}
          onSubmit={handleCreateBooking}
        />

        <GuestBookingModal 
          isOpen={isGuestModalOpen}
          onClose={() => setIsGuestModalOpen(false)}
          onSubmit={handleCreateGuestBooking}
        />

        <ShuttleBookingModal 
           isOpen={isShuttleModalOpen}
           onClose={() => setIsShuttleModalOpen(false)}
           onSubmit={handleCreateShuttleBooking}
        />

        <ShareLinkModal 
           isOpen={isShareModalOpen}
           onClose={() => setIsShareModalOpen(false)}
           onSimulate={() => {
             setIsShareModalOpen(false);
             setIsPublicFormOpen(true);
           }}
        />

        <PublicGuestForm 
           isOpen={isPublicFormOpen}
           onClose={() => setIsPublicFormOpen(false)}
        />

        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            vehicle={vehicles.find(v => v.id === selectedBooking.vehicleId)}
            driver={drivers.find(d => d.id === selectedBooking.driverId)}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </main>
    </div>
  );
};

export default App;