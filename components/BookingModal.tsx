import React, { useState } from 'react';
import { Vehicle, VehicleStatus, Driver } from '../types';
import { getVehicleRecommendation } from '../services/geminiService';
import { Sparkles, Calendar, MapPin, X, User as UserIcon, Calculator, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers?: Driver[]; // Added drivers prop
  onSubmit: (bookingData: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, vehicles, drivers = [], onSubmit }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  // State for multiple stops
  const [stops, setStops] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    estimatedCost: ''
  });

  if (!isOpen) return null;

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setIsAnalyzing(true);
    const available = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE);
    const result = await getVehicleRecommendation(aiPrompt, available);
    
    setAiSuggestion(result.recommendation);
    if (result.vehicleId) {
      setFormData(prev => ({ ...prev, vehicleId: result.vehicleId! }));
    }
    setIsAnalyzing(false);
  };

  // Stop Management Functions
  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    // Ensure at least one input remains
    setStops(newStops.length ? newStops : ['']);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === stops.length - 1)
    ) return;

    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    setStops(newStops);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter empty stops
    const validStops = stops.filter(s => s.trim() !== '');
    if (validStops.length === 0) {
      alert("Vui lòng nhập ít nhất một điểm đến");
      return;
    }

    const finalDestination = validStops[validStops.length - 1];

    onSubmit({
      ...formData,
      stops: validStops,
      destination: finalDestination // Backward compatibility
    });
    
    onClose();
    // Reset form
    setFormData({ vehicleId: '', driverId: '', startTime: '', endTime: '', purpose: '', estimatedCost: '' });
    setStops(['']);
    setAiSuggestion(null);
    setAiPrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
             <h2 className="text-xl font-bold text-slate-900">Tạo yêu cầu điều xe</h2>
             <p className="text-sm text-slate-500">Khu vực: Hà Nội</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* AI Assistant */}
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
              <Sparkles size={18} />
              <span>Trợ lý Điều phối AI</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="VD: Cần xe sang trọng đón đối tác Nhật tại Nội Bài lúc 14h..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              />
              <button 
                onClick={handleAiAssist}
                disabled={isAnalyzing || !aiPrompt}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold transition-all shadow-md shadow-indigo-200"
              >
                {isAnalyzing ? 'Đang xử lý...' : 'Gợi ý xe'}
              </button>
            </div>
            {aiSuggestion && (
              <div className="mt-4 text-sm text-slate-700 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-fadeIn leading-relaxed">
                <strong className="text-indigo-600">Đề xuất:</strong> {aiSuggestion}
              </div>
            )}
          </div>

          <form id="bookingForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Journey Details */}
            <section>
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 border-b pb-2">Thông tin lộ trình</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Bắt đầu</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                        required
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                        />
                    </div>
                   </div>

                    <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Kết thúc dự kiến</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                        required
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                    </div>
               </div>

               {/* Multi-Stop Management */}
               <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Danh sách điểm đến</label>
                     <button 
                        type="button" 
                        onClick={handleAddStop}
                        className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 bg-blue-100 px-2 py-1 rounded-md transition-colors"
                     >
                        <Plus size={14} /> Thêm điểm dừng
                     </button>
                  </div>
                  
                  <div className="space-y-3 relative">
                      {/* Vertical connector line */}
                      {stops.length > 1 && (
                          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-300 z-0"></div>
                      )}

                      {stops.map((stop, index) => (
                          <div key={index} className="relative z-10 flex items-center gap-2 group animate-fadeIn">
                              <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 bg-white ${index === stops.length - 1 ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-400'}`}>
                                  <MapPin size={18} className={index === stops.length - 1 ? 'fill-red-50' : ''} />
                              </div>
                              <input
                                  required
                                  type="text"
                                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                                  placeholder={index === stops.length - 1 ? "Điểm kết thúc..." : `Điểm dừng số ${index + 1}...`}
                                  value={stop}
                                  onChange={e => handleStopChange(index, e.target.value)}
                              />
                              
                              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col">
                                      <button 
                                          type="button"
                                          disabled={index === 0}
                                          onClick={() => handleMoveStop(index, 'up')}
                                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                      >
                                          <ArrowUp size={14} />
                                      </button>
                                      <button 
                                          type="button"
                                          disabled={index === stops.length - 1}
                                          onClick={() => handleMoveStop(index, 'down')}
                                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                      >
                                          <ArrowDown size={14} />
                                      </button>
                                  </div>
                                  <button 
                                      type="button"
                                      onClick={() => handleRemoveStop(index)}
                                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                      title="Xóa điểm này"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Mục đích</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                    placeholder="Công tác, đưa đón khách..."
                    value={formData.purpose}
                    onChange={e => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>
            </section>

            {/* Asset Selection */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 border-b pb-2">Tài sản & Nhân sự</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Vehicle Selection */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Chọn xe</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      required
                    >
                      <option value="">-- Chọn xe --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id} disabled={v.status !== VehicleStatus.AVAILABLE}>
                           {v.name} - {v.seats} chỗ ({v.status})
                        </option>
                      ))}
                    </select>
                 </div>

                 {/* Driver Selection */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tài xế (Tùy chọn)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <select 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.driverId}
                        onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                      >
                        <option value="">-- Tự động điều phối sau --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.status})
                          </option>
                        ))}
                      </select>
                    </div>
                 </div>

                 {/* Cost Estimation */}
                 <div className="col-span-1 md:col-span-2 space-y-2">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Dự toán chi phí (VNĐ)</label>
                     <div className="relative">
                        <Calculator className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                          type="number"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nhập chi phí dự kiến..."
                          value={formData.estimatedCost}
                          onChange={e => setFormData({...formData, estimatedCost: e.target.value})}
                        />
                     </div>
                 </div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button form="bookingForm" type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all transform active:scale-95">
            Xác nhận yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;