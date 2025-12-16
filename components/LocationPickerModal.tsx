import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Search, CheckCircle2 } from 'lucide-react';

interface LocationPickerModalProps {
  onClose: () => void;
  onSelect: (location: string) => void;
  initialLocation?: string;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ onClose, onSelect, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<{x: number, y: number} | null>(null);
  const [address, setAddress] = useState(initialLocation || '');
  const [isLocating, setIsLocating] = useState(false);

  // Mock hotspots for demo
  const hotspots = [
    { x: 50, y: 50, name: 'Sân bay Nội Bài (T1)', address: 'Nhà ga T1, Sân bay Quốc tế Nội Bài' },
    { x: 45, y: 60, name: 'Tòa nhà TechnoPark', address: 'TechnoPark Tower, Vinhomes Ocean Park' },
    { x: 55, y: 40, name: 'Khách sạn Metropole', address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội' },
    { x: 30, y: 70, name: 'Royal City', address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội' },
  ];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSelectedPos({ x, y });
    setAddress(`Vị trí đã ghim (${x.toFixed(2)}, ${y.toFixed(2)})`);
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(() => {
          setTimeout(() => {
              setSelectedPos({ x: 50, y: 50 }); // Center of mock map
              setAddress("Vị trí hiện tại của bạn");
              setIsLocating(false);
          }, 1000);
       }, () => {
          alert("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.");
          setIsLocating(false);
       });
    } else {
        setIsLocating(false);
    }
  };

  const handleConfirm = () => {
     if (address) {
         onSelect(address);
         onClose();
     }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
           <h3 className="font-bold text-lg text-slate-800">Chọn vị trí trên bản đồ</h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
             <X size={20} />
           </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
           <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Tìm kiếm địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
              <button 
                onClick={handleCurrentLocation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-blue-200 transition-colors"
              >
                 {isLocating ? <span className="animate-spin">⌛</span> : <Navigation size={12} />}
                 Vị trí hiện tại
              </button>
              {hotspots.map((spot, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                        setSelectedPos({ x: spot.x, y: spot.y });
                        setAddress(spot.address);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium whitespace-nowrap hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {spot.name}
                  </button>
              ))}
           </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100 cursor-crosshair overflow-hidden group" onClick={handleMapClick}>
            {/* Map Background */}
            <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
            
            {/* Grid Lines for tech feel */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>

            {/* Selected Pin */}
            {selectedPos && (
                <div 
                    className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
                    style={{ left: `${selectedPos.x}%`, top: `${selectedPos.y}%` }}
                >
                    <MapPin size={40} className="text-red-500 fill-red-500 drop-shadow-xl" />
                    <div className="w-3 h-1.5 bg-black/30 rounded-full blur-sm mx-auto mt-[-4px]"></div>
                </div>
            )}

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-slate-500 font-mono pointer-events-none">
               Google Maps Data ©2024
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
           <div className="mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ đã chọn</label>
              <div className="flex items-center gap-2 mt-1">
                 <MapPin size={16} className="text-red-500" />
                 <input 
                    type="text" 
                    className="flex-1 font-medium text-slate-900 outline-none border-b border-slate-200 focus:border-blue-500 py-1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Chọn vị trí trên bản đồ..."
                 />
              </div>
           </div>
           <button 
             onClick={handleConfirm}
             disabled={!address}
             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             Xác nhận vị trí
           </button>
        </div>

      </div>
    </div>
  );
};

export default LocationPickerModal;