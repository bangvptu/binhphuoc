import React, { useState } from 'react';
import { VehicleType } from '../types';
import { UserPlus, MapPin, Calendar, Clock, DollarSign, X, Smartphone, Car, Star, Truck, ShieldCheck } from 'lucide-react';

interface GuestBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}

const GuestBookingModal: React.FC<GuestBookingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    pickupLocation: '',
    destination: '',
    vehicleType: VehicleType.SEDAN,
    startTime: '',
    durationHours: 2,
  });

  // Mock price calculation
  const getEstimatedPrice = () => {
    let basePrice = 200000;
    if (formData.vehicleType === VehicleType.SUV) basePrice = 300000;
    if (formData.vehicleType === VehicleType.LUXURY) basePrice = 800000;
    if (formData.vehicleType === VehicleType.VAN) basePrice = 500000;
    return basePrice + (formData.durationHours * 100000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startTime) {
        alert("Vui lòng chọn thời gian đón");
        return;
    }
    const endTime = new Date(new Date(formData.startTime).getTime() + formData.durationHours * 3600000).toISOString();
    
    onSubmit({
      ...formData,
      endTime,
      estimatedCost: getEstimatedPrice()
    });
    onClose();
    // Reset
    setFormData({
      guestName: '',
      guestPhone: '',
      pickupLocation: '',
      destination: '',
      vehicleType: VehicleType.SEDAN,
      startTime: '',
      durationHours: 2,
    });
  };

  const vehicleOptions = [
      { type: VehicleType.SEDAN, label: 'Sedan 4 chỗ', icon: Car, desc: 'Tiêu chuẩn' },
      { type: VehicleType.SUV, label: 'SUV 7 chỗ', icon: ShieldCheck, desc: 'Rộng rãi' },
      { type: VehicleType.VAN, label: 'Van 16 chỗ', icon: Truck, desc: 'Đoàn đông' },
      { type: VehicleType.LUXURY, label: 'Luxury Class', icon: Star, desc: 'VIP / Sang trọng' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header - Distinct Style for Guest */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-2xl shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserPlus size={24} className="text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Đặt xe vãng lai</h2>
                <p className="text-white/80 text-sm">Dành cho khách hàng chưa có tài khoản doanh nghiệp</p>
             </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="guestForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Guest Info */}
            <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Thông tin khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Họ tên</label>
                        <input
                        required
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="VD: Nguyễn Văn Khách"
                        value={formData.guestName}
                        onChange={e => setFormData({...formData, guestName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Số điện thoại</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                            required
                            type="tel"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            placeholder="VD: 09xx..."
                            value={formData.guestPhone}
                            onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* Location */}
            <section>
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Lộ trình</h3>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Điểm đón</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-emerald-500" size={18} />
                            <input
                            required
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            placeholder="VD: Sảnh A, Khách sạn Metropole..."
                            value={formData.pickupLocation}
                            onChange={e => setFormData({...formData, pickupLocation: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Điểm đến</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-red-500" size={18} />
                            <input
                            required
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            placeholder="VD: Sân bay Nội Bài, Ga Hà Nội..."
                            value={formData.destination}
                            onChange={e => setFormData({...formData, destination: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* Vehicle Selection */}
            <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Loại xe yêu cầu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {vehicleOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.vehicleType === option.type;
                        return (
                            <button
                                key={option.type}
                                type="button"
                                onClick={() => setFormData({...formData, vehicleType: option.type})}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    isSelected 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                                }`}
                            >
                                <Icon size={24} className={`mb-2 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className="text-xs font-bold">{option.label}</span>
                                <span className="text-[10px] opacity-80">{option.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Time */}
            <section>
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Thời gian</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Thời gian đón</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                required
                                type="datetime-local"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                value={formData.startTime}
                                onChange={e => setFormData({...formData, startTime: e.target.value})}
                            />
                        </div>
                    </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Thời gian thuê (Giờ)</label>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-1">
                                <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.durationHours}
                                    onChange={e => setFormData({...formData, durationHours: parseInt(e.target.value) || 0})}
                                />
                             </div>
                             <div className="flex gap-1">
                                 {[2, 4, 8].map(h => (
                                     <button
                                        key={h}
                                        type="button"
                                        onClick={() => setFormData({...formData, durationHours: h})}
                                        className={`w-10 h-[42px] rounded-lg text-xs font-bold border transition-colors ${
                                            formData.durationHours === h 
                                            ? 'bg-orange-100 border-orange-200 text-orange-700' 
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                     >
                                         {h}h
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Quote */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                    <span className="text-orange-900 font-bold text-sm block">Báo giá tạm tính</span>
                    <p className="text-orange-700/70 text-xs">Giá chưa bao gồm VAT & Phí cầu đường</p>
                </div>
                <div className="text-2xl font-bold text-orange-600 flex items-center">
                    {new Intl.NumberFormat('vi-VN').format(getEstimatedPrice())} <span className="text-sm font-medium ml-1 text-orange-500">₫</span>
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button form="guestForm" type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg shadow-lg shadow-orange-200 transition-all transform active:scale-95">
            Xác nhận đặt xe
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestBookingModal;