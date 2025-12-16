import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, Bus, MapPin, Calendar, Users, Smartphone, User, ArrowRightLeft, DollarSign, Navigation, Map } from 'lucide-react';
import { SHUTTLE_CONFIG } from '../constants';
import LocationPickerModal from './LocationPickerModal';

interface PublicGuestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicGuestForm: React.FC<PublicGuestFormProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    routeId: SHUTTLE_CONFIG.ROUTES[0].id,
    specificLocation: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    seats: 1,
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
    } catch (error) {
      alert("Có lỗi xảy ra khi kết nối đến server");
      setStep('form');
    }
  };

  const handleLocationSelect = (location: string) => {
     setFormData(prev => ({ ...prev, specificLocation: location }));
  };

  const totalPrice = formData.seats * SHUTTLE_CONFIG.PRICE_PER_SEAT;
  const currentRoute = SHUTTLE_CONFIG.ROUTES.find(r => r.id === formData.routeId);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fadeIn overflow-hidden">
      {/* Mobile Header */}
      <div className="bg-purple-700 px-6 py-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3 text-white">
           <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
             <Bus size={24} />
           </div>
           <div>
             <h1 className="font-bold text-lg leading-none">Đặt xe ghép</h1>
             <span className="text-xs text-purple-200 font-mono">Trấn Biên ⇄ Bình Phước</span>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-md mx-auto p-6">
          
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Marketing Banner */}
              <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                 <div className="flex items-center justify-between mb-2">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Giá Cố Định</span>
                    <span className="text-slate-500 text-xs flex items-center gap-1"><CheckCircle2 size={12}/> Xe 4 chỗ & 7 chỗ</span>
                 </div>
                 <div className="text-2xl font-bold text-slate-900 mb-1">
                    {new Intl.NumberFormat('vi-VN').format(SHUTTLE_CONFIG.PRICE_PER_SEAT)}đ <span className="text-sm font-medium text-slate-500">/ ghế</span>
                 </div>
                 <p className="text-xs text-slate-500">
                    Cam kết không tăng giá giờ cao điểm. Không thu phụ phí. Đón trả tận nơi.
                 </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Chọn Hành Trình</h3>
                
                {/* Route Selection */}
                <div className="grid grid-cols-1 gap-3">
                   {SHUTTLE_CONFIG.ROUTES.map((route) => (
                      <div 
                         key={route.id}
                         onClick={() => setFormData({...formData, routeId: route.id})}
                         className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                             formData.routeId === route.id 
                             ? 'border-purple-600 bg-purple-50' 
                             : 'border-white bg-white hover:border-purple-200'
                         }`}
                      >
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-full ${formData.routeId === route.id ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                                 <Navigation size={20} />
                             </div>
                             <div>
                                 <p className={`font-bold ${formData.routeId === route.id ? 'text-purple-900' : 'text-slate-700'}`}>{route.name}</p>
                                 <p className="text-xs text-slate-500">{formData.routeId === route.id ? 'Đang chọn' : 'Nhấn để chọn'}</p>
                             </div>
                         </div>
                         {formData.routeId === route.id && <CheckCircle2 className="text-purple-600" size={20} />}
                      </div>
                   ))}
                </div>

                <div className="relative flex gap-2">
                   <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-3.5 text-red-500" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Địa chỉ chi tiết tại ${currentRoute?.from}...`}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                            value={formData.specificLocation}
                            onChange={e => setFormData({...formData, specificLocation: e.target.value})}
                        />
                   </div>
                   <button 
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="px-4 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors flex items-center justify-center border border-purple-200"
                      title="Chọn trên bản đồ"
                   >
                       <Map size={20} />
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Thông tin đặt vé</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Tên bạn"
                        className="w-full pl-11 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="relative">
                      <Smartphone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required
                        type="tel" 
                        placeholder="SĐT"
                        className="w-full pl-11 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      required
                      type="date" 
                      className="w-full pl-11 pr-2 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <select 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  >
                    <option>07:00</option>
                    <option>08:00</option>
                    <option>09:00</option>
                    <option>10:00</option>
                    <option>14:00</option>
                    <option>17:00</option>
                    <option>18:00</option>
                  </select>
                </div>

                {/* Seat Selector & Total Price */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase">Số lượng ghế</span>
                        <div className="flex items-center gap-3 mt-1">
                           <button 
                             type="button"
                             onClick={() => setFormData(prev => ({...prev, seats: Math.max(1, prev.seats - 1)}))}
                             className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                           >
                             -
                           </button>
                           <span className="font-bold text-xl">{formData.seats}</span>
                           <button 
                              type="button"
                              onClick={() => setFormData(prev => ({...prev, seats: Math.min(7, prev.seats + 1)}))}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                           >
                             +
                           </button>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">Tổng tiền</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {new Intl.NumberFormat('vi-VN').format(totalPrice)} <span className="text-sm">đ</span>
                      </p>
                   </div>
                </div>
              </div>

              <div className="pt-2">
                 <button 
                   type="submit"
                   className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-200 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   Xác Nhận Đặt Chỗ
                   <ArrowRightLeft size={20} />
                 </button>
                 <p className="text-center text-xs text-slate-400 mt-4">
                   Nhà xe sẽ gọi xác nhận trong vòng 15 phút.
                 </p>
              </div>
            </form>
          )}

          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
               <Loader2 size={48} className="text-purple-600 animate-spin mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Đang xử lý đặt chỗ...</h3>
               <p className="text-slate-500 text-center mt-2">Vui lòng không tắt trình duyệt</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 animate-fadeIn text-center">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 size={40} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Đặt chỗ thành công!</h3>
               
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full mb-6 text-left">
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Khách hàng:</span>
                      <span className="font-bold text-slate-900">{formData.name}</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Tuyến:</span>
                      <span className="font-bold text-slate-900">{currentRoute?.name}</span>
                   </div>
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-sm">Số ghế:</span>
                      <span className="font-bold text-slate-900">{formData.seats}</span>
                   </div>
                   <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-500 text-sm font-bold">Thành tiền:</span>
                      <span className="font-bold text-purple-600">{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                   </div>
               </div>

               <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                 Tài xế sẽ liên hệ qua số <strong>{formData.phone}</strong> trước giờ khởi hành. Cảm ơn bạn đã chọn chúng tôi!
               </p>
               <button 
                 onClick={() => {
                   setStep('form');
                   setFormData({...formData, seats: 1, specificLocation: '', note: ''});
                 }}
                 className="w-full px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
               >
                 Đặt thêm chuyến khác
               </button>
            </div>
          )}

        </div>
      </div>
      
      {isMapPickerOpen && (
          <LocationPickerModal 
              onClose={() => setIsMapPickerOpen(false)}
              onSelect={handleLocationSelect}
              initialLocation={formData.specificLocation}
          />
      )}
    </div>
  );
};

export default PublicGuestForm;