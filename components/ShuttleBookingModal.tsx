import React, { useState } from 'react';
import { ShuttleStatus } from '../types';
import { SHUTTLE_CONFIG } from '../constants';
import { Bus, MapPin, Calendar, Users, X, Smartphone, User, DollarSign, Navigation } from 'lucide-react';

interface ShuttleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ShuttleBookingModal: React.FC<ShuttleBookingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    routeId: SHUTTLE_CONFIG.ROUTES[0].id,
    specificLocation: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00',
    paxCount: 1,
  });

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoute = SHUTTLE_CONFIG.ROUTES.find(r => r.id === formData.routeId);
    onSubmit({
      ...formData,
      pickupLocation: `${selectedRoute?.from} (${formData.specificLocation || 'Điểm chuẩn'})`,
      destination: selectedRoute?.to,
      totalPrice: formData.paxCount * SHUTTLE_CONFIG.PRICE_PER_SEAT,
      status: ShuttleStatus.REGISTERED
    });
    onClose();
    // Reset form
    setFormData({
      guestName: '',
      guestPhone: '',
      routeId: SHUTTLE_CONFIG.ROUTES[0].id,
      specificLocation: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '08:00',
      paxCount: 1,
    });
  };

  const totalPrice = formData.paxCount * SHUTTLE_CONFIG.PRICE_PER_SEAT;
  const currentRoute = SHUTTLE_CONFIG.ROUTES.find(r => r.id === formData.routeId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg">
                <Bus size={24} className="text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Đặt xe ghép (Admin)</h2>
                <p className="text-white/80 text-sm">Trấn Biên ↔ Bình Phước • Giá cố định</p>
             </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="shuttleForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Pricing Rule Alert */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
               <DollarSign size={20} className="text-blue-600 mt-0.5" />
               <div className="text-sm text-blue-800">
                  <p className="font-bold">Quy tắc tính tiền tự động:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 opacity-90">
                      <li>Đơn giá: <strong>{new Intl.NumberFormat('vi-VN').format(SHUTTLE_CONFIG.PRICE_PER_SEAT)}đ</strong> / ghế.</li>
                      <li>Áp dụng cho cả xe 4 chỗ và 7 chỗ.</li>
                      <li>Không thu phụ phí, không mặc cả.</li>
                  </ul>
               </div>
            </div>

            {/* Guest Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Họ tên</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            required
                            type="text"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Tên khách..."
                            value={formData.guestName}
                            onChange={e => setFormData({...formData, guestName: e.target.value})}
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Điện thoại</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            required
                            type="tel"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="09xx..."
                            value={formData.guestPhone}
                            onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Route & Seat Selection */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Chọn tuyến đường</label>
                    <div className="grid grid-cols-2 gap-3">
                        {SHUTTLE_CONFIG.ROUTES.map(route => (
                            <button
                                key={route.id}
                                type="button"
                                onClick={() => setFormData({...formData, routeId: route.id})}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                                    formData.routeId === route.id
                                    ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50'
                                }`}
                            >
                                <Navigation size={18} />
                                {route.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Điểm đón chi tiết</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 text-red-500" size={16} />
                        <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder={`VD: Tại ${currentRoute?.from}...`}
                            value={formData.specificLocation}
                            onChange={e => setFormData({...formData, specificLocation: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Ngày đi</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                required
                                type="date"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Số ghế đặt</label>
                        <div className="relative">
                             <Users className="absolute left-3 top-2.5 text-gray-400" size={16} />
                             <input
                                required
                                type="number"
                                min="1"
                                max="7"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-bold text-slate-800"
                                value={formData.paxCount}
                                onChange={e => setFormData({...formData, paxCount: parseInt(e.target.value) || 1})}
                            />
                        </div>
                     </div>
                </div>
            </div>

            {/* Price Calculation (Auto) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Tổng thành tiền</p>
                    <p className="text-xs text-slate-400">{formData.paxCount} ghế x {new Intl.NumberFormat('vi-VN').format(SHUTTLE_CONFIG.PRICE_PER_SEAT)}</p>
                 </div>
                 <div className="text-2xl font-bold text-purple-600">
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)} <span className="text-sm">đ</span>
                 </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Khung giờ</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                    {timeSlots.map(time => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => setFormData({...formData, timeSlot: time})}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                formData.timeSlot === time 
                                ? 'bg-purple-600 text-white border-purple-600 font-bold' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            Hủy
          </button>
          <button form="shuttleForm" type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md shadow-purple-200 transition-all active:scale-95">
            Xác nhận đặt vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShuttleBookingModal;