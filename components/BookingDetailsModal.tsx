import React, { useState, useEffect, useRef } from 'react';
import { Booking, BookingStatus, Vehicle, Driver } from '../types';
import { 
  X, MapPin, Calendar, Clock, User, Phone, Car, CreditCard, 
  Navigation, Shield, Mail, QrCode, Map as MapIcon, History, 
  CheckCircle2, CircleDot, Locate, Loader2, AlertTriangle,
  StopCircle, Radio
} from 'lucide-react';
import L from 'leaflet';

interface BookingDetailsModalProps {
  booking: Booking;
  vehicle?: Vehicle;
  driver?: Driver;
  onClose: () => void;
}

// Mock Coordinates for Route Simulation (Hanoi Area)
const ROUTE_COORDS: [number, number][] = [
  [21.028511, 105.854444], // Hoan Kiem
  [21.030000, 105.850000],
  [21.035000, 105.845000],
  [21.040000, 105.840000], // Near Mausoleum
  [21.050000, 105.830000],
  [21.060000, 105.820000], // West Lake
  [21.070000, 105.810000],
  [21.080000, 105.805000],
  [21.100000, 105.800000], // Nhat Tan Bridge area
  [21.150000, 105.790000],
  [21.218715, 105.804171]  // Noi Bai Airport
];

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, vehicle, driver, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tracking'>('info');
  const [tripStats, setTripStats] = useState({ speed: 0, distance: 30.5 }); // Mock distance

  // Location State
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isWatching, setIsWatching] = useState(false);
  const watchId = useRef<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Leaflet Refs
  const mapRef = useRef<L.Map | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map when tab switches to tracking
  useEffect(() => {
    if (activeTab === 'tracking' && !mapRef.current) {
        // Delay slightly to ensure DOM is ready
        setTimeout(() => {
            if (document.getElementById('leaflet-map')) {
                initMap();
            }
        }, 100);
    }
    
    // Cleanup map on unmount or tab switch
    return () => {
        if (activeTab !== 'tracking' && mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [activeTab]);

  const initMap = () => {
      if (mapRef.current) return;

      const map = L.map('leaflet-map', {
          zoomControl: false,
          attributionControl: false
      }).setView(ROUTE_COORDS[0], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
      }).addTo(map);
      
      // Add Zoom Control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Draw Route
      const polyline = L.polyline(ROUTE_COORDS, {
          color: '#3b82f6', // Blue-500
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round'
      }).addTo(map);
      routeLineRef.current = polyline;

      // Fit bounds to route initially
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Add Start Marker
      const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
      });
      L.marker(ROUTE_COORDS[0], { icon: startIcon }).addTo(map).bindPopup("Điểm đón: " + booking.pickupLocation);

      // Add End Marker
      const endIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
      });
      L.marker(ROUTE_COORDS[ROUTE_COORDS.length - 1], { icon: endIcon }).addTo(map).bindPopup("Điểm đến: " + booking.destination);

      // Add Car Marker
      const carHtml = `
        <div class="relative w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="bg-blue-600 p-2 rounded-full shadow-lg shadow-blue-500/50 text-white relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M2 12h12"/></svg>
            </div>
            <div class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        </div>
      `;
      const carIcon = L.divIcon({
          className: 'custom-div-icon',
          html: carHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
      });

      carMarkerRef.current = L.marker(ROUTE_COORDS[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
      
      mapRef.current = map;
      startCarAnimation();
  };

  const startCarAnimation = () => {
    let startTime: number | null = null;
    const duration = 30000; // 30 seconds loop
    
    const animate = (timestamp: number) => {
        if (!mapRef.current || !carMarkerRef.current) return;
        
        if (!startTime) startTime = timestamp;
        const progress = ((timestamp - startTime) % duration) / duration;
        
        // Find current position on polyline
        const totalPoints = ROUTE_COORDS.length - 1;
        const exactIndex = progress * totalPoints;
        const index = Math.floor(exactIndex);
        const nextIndex = Math.min(index + 1, totalPoints);
        const segmentProgress = exactIndex - index;

        const [lat1, lng1] = ROUTE_COORDS[index];
        const [lat2, lng2] = ROUTE_COORDS[nextIndex];

        const currentLat = lat1 + (lat2 - lat1) * segmentProgress;
        const currentLng = lng1 + (lng2 - lng1) * segmentProgress;
        
        const newPos = new L.LatLng(currentLat, currentLng);
        carMarkerRef.current.setLatLng(newPos);

        // Update stats
        setTripStats({
            speed: Math.floor(40 + Math.sin(timestamp / 500) * 10),
            distance: Math.max(0, 30.5 * (1 - progress))
        });

        // Loop
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  // Handle User Location (GPS)
  const toggleLocationTracking = () => {
    if (isWatching) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsWatching(false);
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setLocationStatus('idle');

    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị.");
      setIsLocating(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLng = new L.LatLng(latitude, longitude);
        
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        setLocationStatus('success');
        setIsWatching(true);

        if (mapRef.current) {
            // Add or Update User Marker
            if (!userMarkerRef.current) {
                const userIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `
                      <div class="relative w-6 h-6 flex items-center justify-center">
                        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                        <div class="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                      </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                userMarkerRef.current = L.marker(latLng, { icon: userIcon }).addTo(mapRef.current);
            } else {
                userMarkerRef.current.setLatLng(latLng);
            }
            // Pan map to user
            mapRef.current.flyTo(latLng, 14);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setIsLocating(false);
        if (error.code === 1) {
             setLocationStatus('error');
             setIsWatching(false);
             alert("Vui lòng cho phép truy cập vị trí.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    
    watchId.current = id;
  };

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

  // Merge pickup, stops, and destination into a single route array for visualization (list view)
  const routePoints = [
    { type: 'start', address: booking.pickupLocation || 'Điểm đón mặc định', label: 'Điểm đón' },
    ...(booking.stops?.slice(0, -1).map((stop, idx) => ({ type: 'stop', address: stop, label: `Điểm dừng ${idx + 1}` })) || []),
    { type: 'end', address: booking.destination, label: 'Điểm đến' }
  ];

  // Generate Mock Logs based on booking status
  const generateLogs = () => {
    const logs = [
      { time: booking.createdAt, title: 'Tạo yêu cầu', desc: 'Yêu cầu đặt xe được khởi tạo trên hệ thống.', active: true },
    ];

    if (booking.status !== BookingStatus.PENDING) {
       logs.unshift({ 
         time: new Date(new Date(booking.createdAt).getTime() + 15 * 60000).toISOString(), 
         title: 'Đã xác nhận', 
         desc: 'Điều phối viên đã tiếp nhận yêu cầu.', 
         active: true 
       });
    }

    if (vehicle && (booking.status === BookingStatus.ASSIGNED || booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.COMPLETED)) {
       logs.unshift({ 
         time: new Date(new Date(booking.createdAt).getTime() + 45 * 60000).toISOString(), 
         title: 'Điều phối xe', 
         desc: `Gán xe ${vehicle.name} (${vehicle.plate}) và tài xế ${driver?.name || 'N/A'}.`, 
         active: true 
       });
    }

    if (booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.COMPLETED) {
       logs.unshift({ 
         time: booking.startTime, 
         title: 'Bắt đầu hành trình', 
         desc: 'Tài xế đã đón khách và bắt đầu di chuyển.', 
         active: true 
       });
    }

    if (booking.status === BookingStatus.COMPLETED) {
       logs.unshift({ 
         time: booking.endTime, 
         title: 'Hoàn thành', 
         desc: 'Chuyến đi kết thúc thành công. Đã ghi nhận thanh toán.', 
         active: true 
       });
    } else {
        logs.unshift({
            time: booking.status === BookingStatus.IN_PROGRESS ? 'Đang cập nhật...' : 'Dự kiến',
            title: booking.status === BookingStatus.IN_PROGRESS ? 'Đang di chuyển' : 'Hoàn thành chuyến đi',
            desc: 'Đang chờ cập nhật trạng thái tiếp theo...',
            active: false
        });
    }

    return logs;
  };

  const logs = generateLogs();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({id: booking.id, user: booking.userName || booking.guestName}))}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50 pb-0">
          <div className="w-full">
            <div className="flex justify-between items-start mb-4">
               <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">Chi tiết chuyến đi</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    booking.status === BookingStatus.APPROVED ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                    booking.status === BookingStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-200' : 
                    booking.status === BookingStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-mono uppercase">Mã đơn: #{booking.id}</p>
               </div>
               <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-2">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                    Thông tin chung
                </button>
                <button 
                  onClick={() => setActiveTab('tracking')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'tracking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                    <Navigation size={16} />
                    Giám sát & QR
                </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
          
          {activeTab === 'info' ? (
            <div className="space-y-8 animate-fadeIn">
              {/* 1. Route Timeline */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Navigation size={16} className="text-blue-600" />
                  Lộ trình di chuyển
                </h3>
                <div className="relative pl-2 space-y-0">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-slate-200"></div>

                  {routePoints.map((point, index) => (
                    <div key={index} className="relative flex items-start gap-4 pb-6 last:pb-0">
                        <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white shrink-0 
                          ${point.type === 'start' ? 'border-green-500 text-green-500' : point.type === 'end' ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-400'}`}>
                          <MapPin size={14} className={point.type === 'end' ? 'fill-red-500' : ''} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase block mb-0.5">{point.label}</span>
                          <p className="text-slate-800 font-medium leading-tight">{point.address}</p>
                        </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Bắt đầu</p>
                        <p className="text-sm font-bold text-slate-800">{formatDate(booking.startTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-orange-600">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Kết thúc (Dự kiến)</p>
                        <p className="text-sm font-bold text-slate-800">{formatDate(booking.endTime)}</p>
                      </div>
                    </div>
                </div>
              </section>

              {/* 2. Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Asset Info */}
                <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Car size={16} className="text-blue-600" />
                      Phương tiện & Tài xế
                    </h3>
                    
                    <div className="space-y-4">
                      {vehicle ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <img src={vehicle.imageUrl} alt="Car" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{vehicle.name}</p>
                              <p className="text-xs text-slate-500">{vehicle.plate} • {vehicle.type}</p>
                            </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm italic">
                          Chưa điều phối xe
                        </div>
                      )}

                      {driver ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <img src={driver.avatar} alt="Driver" className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Shield size={10} /> {driver.licenseClass}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Phone size={10} /> {driver.phone}</span>
                              </div>
                            </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm italic">
                          Chưa chỉ định tài xế
                        </div>
                      )}
                    </div>
                </section>

                {/* Passenger & Cost Info */}
                <section className="flex flex-col h-full">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={16} className="text-blue-600" />
                      Thông tin hành khách
                    </h3>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                      <div className="mb-4">
                          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Người đặt / Hành khách</p>
                          {booking.isGuest ? (
                            <>
                              <p className="text-base font-bold text-orange-700">{booking.guestName} (Khách)</p>
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                <Phone size={14} /> {booking.guestPhone}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-base font-bold text-slate-900">{booking.userName}</p>
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                <Mail size={14} /> Nội bộ doanh nghiệp
                              </p>
                            </>
                          )}
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4 mt-4">
                          <h4 className="text-xs text-slate-500 font-semibold uppercase mb-3 flex items-center gap-2">
                            <CreditCard size={14} /> Chi phí
                          </h4>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-600">Dự toán:</span>
                            <span className="font-medium text-slate-900">{formatCurrency(booking.estimatedCost)}</span>
                          </div>
                          {booking.actualRevenue && (
                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                              <span className="text-sm text-emerald-600 font-bold">Thực tế:</span>
                              <span className="font-bold text-emerald-600 text-lg">{formatCurrency(booking.actualRevenue)}</span>
                            </div>
                          )}
                      </div>
                    </div>
                </section>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-1">Mục đích chuyến đi</h4>
                <p className="text-sm text-blue-700 leading-relaxed">{booking.purpose}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn h-full flex flex-col">
                {/* 1. Map GPS */}
                <section className="flex-1 flex flex-col min-h-[400px]">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                         <MapIcon size={16} className="text-blue-600" />
                         Định vị GPS (Thời gian thực)
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Share Location Toggle */}
                        <button 
                            onClick={toggleLocationTracking}
                            disabled={isLocating}
                            className={`flex items-center gap-2 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                                isWatching 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                                : locationStatus === 'error'
                                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                        >
                            {isLocating ? <Loader2 size={14} className="animate-spin" /> : isWatching ? <StopCircle size={14} /> : <Locate size={14} />}
                            {isLocating ? 'Đang định vị...' : isWatching ? 'Dừng chia sẻ' : locationStatus === 'error' ? 'Thử lại (GPS)' : 'Chia sẻ vị trí trực tiếp'}
                        </button>
                      </div>
                   </div>
                   
                   <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-300 shadow-inner group">
                      {/* LEAFLET MAP CONTAINER */}
                      <div id="leaflet-map" className="w-full h-full z-0"></div>

                      {/* Start Label (Replaced by Leaflet Popup but kept for style reference if needed) */}

                      {/* Live Stats HUD - Overlay on top of Map */}
                      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-slate-200 flex gap-4 min-w-[200px]">
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Vận tốc</p>
                            <p className="text-lg font-mono font-bold text-slate-800">{tripStats.speed} <span className="text-xs font-sans text-slate-500">km/h</span></p>
                         </div>
                         <div className="w-px bg-slate-200"></div>
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Còn lại</p>
                            <p className="text-lg font-mono font-bold text-slate-800">{tripStats.distance.toFixed(1)} <span className="text-xs font-sans text-slate-500">km</span></p>
                         </div>
                      </div>
                   </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* 2. QR Code */}
                    <section className="col-span-1">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <QrCode size={16} className="text-blue-600" />
                            Mã vé điện tử
                        </h3>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                           <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm mb-3">
                              <img src={qrCodeUrl} alt="Booking QR" className="w-32 h-32 object-contain mix-blend-multiply" />
                           </div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã xác thực</p>
                           <p className="text-lg font-mono font-bold text-slate-900">{booking.id}</p>
                           <p className="text-xs text-slate-500 mt-2">Đưa mã này cho tài xế để xác nhận lên xe</p>
                        </div>
                    </section>

                    {/* 3. Trip Logs */}
                    <section className="col-span-1 md:col-span-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History size={16} className="text-blue-600" />
                            Nhật ký hành trình
                        </h3>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="max-h-[300px] overflow-y-auto p-0">
                               <table className="w-full text-sm text-left">
                                   <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                       <tr>
                                           <th className="px-4 py-3 font-semibold text-xs uppercase">Thời gian</th>
                                           <th className="px-4 py-3 font-semibold text-xs uppercase">Trạng thái</th>
                                           <th className="px-4 py-3 font-semibold text-xs uppercase">Chi tiết</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                       {logs.map((log, idx) => (
                                           <tr key={idx} className={log.active ? 'bg-white' : 'bg-slate-50/50 opacity-60'}>
                                               <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                                                   {log.active ? formatDate(log.time) : log.time}
                                               </td>
                                               <td className="px-4 py-3">
                                                   <div className="flex items-center gap-2">
                                                       {log.active ? <CheckCircle2 size={14} className="text-green-500" /> : <CircleDot size={14} className="text-slate-300" />}
                                                       <span className={`font-semibold ${log.active ? 'text-slate-800' : 'text-slate-400'}`}>{log.title}</span>
                                                   </div>
                                               </td>
                                               <td className="px-4 py-3 text-slate-600 text-xs">
                                                   {log.desc}
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                        </div>
                    </section>
                </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
           >
             Đóng
           </button>
           {activeTab === 'tracking' ? (
              <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> Xác nhận đón khách
              </button>
           ) : (
              <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                In Lệnh Điều Xe
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;