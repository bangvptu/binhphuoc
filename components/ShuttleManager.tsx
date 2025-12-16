import React, { useState, useMemo } from 'react';
import { ShuttleBooking, ShuttleStatus, Driver, Vehicle, VehicleStatus } from '../types';
import { Bus, Clock, CalendarDays, AlertTriangle, Users, Phone, MapPin, CheckCircle, PhoneCall, Send, Car, UserCircle2, Crown, Map as MapIcon, List, History } from 'lucide-react';

interface ShuttleManagerProps {
  bookings: ShuttleBooking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onUpdateStatus: (id: string, newStatus: ShuttleStatus) => void;
}

const ShuttleManager: React.FC<ShuttleManagerProps> = ({ bookings, drivers, vehicles, onUpdateStatus }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Local state to store trip assignments
  const [tripAssignments, setTripAssignments] = useState<Record<string, { driverId: string; vehicleId: string; notified: boolean }>>({});

  const handleAssign = (timeSlot: string, field: 'driverId' | 'vehicleId', value: string) => {
    const key = `${selectedDate}-${timeSlot}`;
    setTripAssignments(prev => ({
        ...prev,
        [key]: {
            ...(prev[key] || { driverId: '', vehicleId: '', notified: false }),
            [field]: value
        }
    }));
  };

  const handleNotify = (timeSlot: string, totalPax: number) => {
    if (totalPax === 0) return;
    const key = `${selectedDate}-${timeSlot}`;
    const assignment = tripAssignments[key];
    
    if (!assignment?.driverId || !assignment?.vehicleId) {
        alert("Vui lòng điều phối Xe và Tài xế trước khi gửi thông báo cho khách.");
        return;
    }

    setTripAssignments(prev => ({
        ...prev,
        [key]: {
            ...(prev[key] || { driverId: '', vehicleId: '', notified: false }),
            notified: true
        }
    }));
    alert(`Đã gửi SMS thông báo giờ đón và thông tin tài xế cho ${totalPax} hành khách trong khung giờ ${timeSlot}.`);
  };

  const trips = useMemo(() => {
    // 1. Filter by date
    const filtered = bookings.filter(b => b.date === selectedDate);
    
    // 2. Group by Time Slot
    const groups: Record<string, ShuttleBooking[]> = {};
    filtered.forEach(b => {
      if (!groups[b.timeSlot]) groups[b.timeSlot] = [];
      groups[b.timeSlot].push(b);
    });

    // 3. Algorithm: Sort & Prioritize within groups
    return Object.keys(groups).sort().map(time => {
      let rawPassengers = groups[time];

      // SORTING LOGIC:
      // 1. VIP First
      // 2. Booking Time (Early First)
      rawPassengers.sort((a, b) => {
          if (a.isVIP && !b.isVIP) return -1;
          if (!a.isVIP && b.isVIP) return 1;
          return new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime();
      });

      // CAPACITY LOGIC: Calculate overflow
      let currentLoad = 0;
      const MAX_CAPACITY = 18;
      
      const passengers = rawPassengers.map(p => {
          const projectedLoad = currentLoad + p.paxCount;
          const isOverflow = projectedLoad > MAX_CAPACITY;
          
          // Only add to load if they fit (or partially fit - simplified here to all-or-nothing for groups)
          if (!isOverflow) {
              currentLoad = projectedLoad;
          }
          return { ...p, isOverflow };
      });

      return {
        time,
        passengers,
        totalPax: rawPassengers.reduce((sum, p) => sum + p.paxCount, 0),
        acceptedPax: currentLoad,
        isOverCapacity: rawPassengers.reduce((sum, p) => sum + p.paxCount, 0) > MAX_CAPACITY
      };
    });
  }, [bookings, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
             <Bus size={24} />
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-900">Điều phối xe ghép (Shuttle)</h2>
             <p className="text-sm text-slate-500">Thuật toán ưu tiên: Khách VIP &gt; Đặt sớm</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${
                        viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <List size={16} /> Danh sách
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${
                        viewMode === 'map' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <MapIcon size={16} /> Bản đồ giám sát
                </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-600 pl-2">Ngày:</span>
                <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border-none bg-white rounded-md text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                />
            </div>
        </div>
      </div>

      {viewMode === 'list' ? (
          /* --- LIST VIEW --- */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
            {trips.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                <CalendarDays size={48} className="mx-auto mb-3 opacity-50" />
                <p>Chưa có chuyến xe nào được đặt trong ngày này.</p>
            </div>
            )}

            {trips.map((trip) => {
                const tripKey = `${selectedDate}-${trip.time}`;
                const assignment = tripAssignments[tripKey] || { driverId: '', vehicleId: '', notified: false };
                const selectedDriver = drivers.find(d => d.id === assignment.driverId);
                const selectedVehicle = vehicles.find(v => v.id === assignment.vehicleId);

                return (
                <div key={trip.time} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                    {/* Trip Header */}
                    <div className={`p-4 border-b flex justify-between items-center ${trip.isOverCapacity ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm font-bold text-lg text-slate-800 font-mono">
                        {trip.time}
                        </div>
                        {trip.isOverCapacity && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                            <AlertTriangle size={12} /> Quá tải (+{trip.totalPax - 18})
                        </span>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-bold flex items-center justify-end gap-1 ${trip.isOverCapacity ? 'text-red-600' : 'text-slate-700'}`}>
                        <Users size={14} />
                        {trip.totalPax} / 18
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all ${trip.isOverCapacity ? 'bg-red-500' : trip.totalPax > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((trip.totalPax / 18) * 100, 100)}%` }}
                        ></div>
                        </div>
                    </div>
                    </div>

                    {/* Resource Assignment */}
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                    <Car size={10} /> Xe (Shuttle)
                                </label>
                                <select 
                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                                    value={assignment.vehicleId}
                                    onChange={(e) => handleAssign(trip.time, 'vehicleId', e.target.value)}
                                >
                                    <option value="">-- Chọn xe --</option>
                                    {vehicles.filter(v => v.seats >= 16).map(v => (
                                        <option key={v.id} value={v.id} disabled={v.status !== VehicleStatus.AVAILABLE}>
                                            {v.name} ({v.seats} chỗ)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                    <UserCircle2 size={10} /> Tài xế
                                </label>
                                <select 
                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                                    value={assignment.driverId}
                                    onChange={(e) => handleAssign(trip.time, 'driverId', e.target.value)}
                                >
                                    <option value="">-- Chọn tài xế --</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleNotify(trip.time, trip.acceptedPax)}
                            disabled={assignment.notified || trip.totalPax === 0}
                            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                assignment.notified 
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-100'
                            }`}
                        >
                            {assignment.notified ? (
                                <><CheckCircle size={14} /> Đã thông báo khách</>
                            ) : (
                                <><Send size={14} /> Thông báo giờ đón</>
                            )}
                        </button>
                    </div>

                    {/* Passenger Manifest */}
                    <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {trip.passengers.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">Chưa có khách đăng ký</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Khách hàng</th>
                                <th className="px-4 py-2 text-right font-semibold">SL</th>
                                <th className="px-4 py-2 text-right font-semibold">TT</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {trip.passengers.map(p => (
                                <tr key={p.id} className={`group ${p.isOverflow ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                                <td className="px-4 py-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800 flex items-center gap-1">
                                                {p.guestName}
                                                {p.isVIP && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Phone size={10} /> {p.guestPhone}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} /> {p.pickupLocation}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Booking Metadata */}
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <div className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1" title="Thời gian đặt">
                                            <Clock size={8} /> {new Date(p.bookingTime).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}
                                        </div>
                                        {p.isOverflow && (
                                            <span className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">Hết chỗ</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {p.paxCount}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {!p.isOverflow && (
                                        <>
                                            {p.status === ShuttleStatus.REGISTERED && (
                                            <button 
                                                onClick={() => onUpdateStatus(p.id, ShuttleStatus.CONFIRMED)}
                                                className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 flex items-center gap-1 ml-auto shadow-sm"
                                                title="Gọi xác nhận"
                                            >
                                                <PhoneCall size={12} /> Gọi
                                            </button>
                                            )}
                                            {p.status === ShuttleStatus.CONFIRMED && (
                                            <button 
                                                onClick={() => onUpdateStatus(p.id, ShuttleStatus.PICKED_UP)}
                                                className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 ml-auto"
                                            >
                                                <CheckCircle size={12} /> Đón
                                            </button>
                                            )}
                                            {p.status === ShuttleStatus.PICKED_UP && (
                                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                                <CheckCircle size={10} /> OK
                                            </span>
                                            )}
                                        </>
                                    )}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    </div>
                    
                    {selectedVehicle && (
                        <div className="p-2 bg-slate-800 text-white text-[10px] flex justify-between px-4">
                            <span>Xe: {selectedVehicle.name} ({selectedVehicle.plate})</span>
                            {selectedDriver && <span>TX: {selectedDriver.name}</span>}
                        </div>
                    )}
                </div>
                );
            })}
          </div>
      ) : (
          /* --- MAP MONITORING VIEW --- */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 animate-fadeIn h-[600px] relative overflow-hidden flex flex-col">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Giám sát thời gian thực
                  </h3>
                  <p className="text-xs text-slate-500">Tuyến: Trung tâm Hà Nội ⇄ KCN Hòa Lạc</p>
              </div>

              {/* Simulated Map */}
              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                  
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
                      {/* Route Path */}
                      <path 
                          id="shuttleRoute"
                          d="M 100 300 C 200 300, 300 100, 400 100 S 600 300, 700 200" 
                          stroke="#e2e8f0" 
                          strokeWidth="10" 
                          fill="none" 
                          strokeLinecap="round"
                      />
                      <path 
                          d="M 100 300 C 200 300, 300 100, 400 100 S 600 300, 700 200" 
                          stroke="#8b5cf6" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeLinecap="round"
                          strokeDasharray="8 4"
                          className="animate-[dash_30s_linear_infinite]"
                      />

                      {/* Bus Stops */}
                      <circle cx="100" cy="300" r="8" fill="white" stroke="#64748b" strokeWidth="3" />
                      <text x="100" y="330" textAnchor="middle" className="text-[10px] font-bold fill-slate-600">ROYAL CITY</text>

                      <circle cx="400" cy="100" r="8" fill="white" stroke="#64748b" strokeWidth="3" />
                      <text x="400" y="80" textAnchor="middle" className="text-[10px] font-bold fill-slate-600">BIGC THĂNG LONG</text>

                      <circle cx="700" cy="200" r="8" fill="white" stroke="#64748b" strokeWidth="3" />
                      <text x="700" y="230" textAnchor="middle" className="text-[10px] font-bold fill-slate-600">KCN HÒA LẠC</text>

                      {/* Moving Buses */}
                      <g>
                          <animateMotion dur="20s" repeatCount="indefinite" path="M 100 300 C 200 300, 300 100, 400 100 S 600 300, 700 200" rotate="auto">
                              <mpath href="#shuttleRoute" />
                          </animateMotion>
                          <circle r="12" fill="#8b5cf6" fillOpacity="0.3" />
                          <circle r="6" fill="#7c3aed" />
                          <rect x="-20" y="-35" width="40" height="20" rx="4" fill="white" stroke="#e2e8f0" />
                          <text x="0" y="-22" textAnchor="middle" className="text-[10px] font-bold fill-purple-700">29D-555.88</text>
                      </g>

                      {/* Second Bus (Delayed) */}
                       <g>
                          <animateMotion dur="20s" begin="10s" repeatCount="indefinite" path="M 100 300 C 200 300, 300 100, 400 100 S 600 300, 700 200" rotate="auto">
                              <mpath href="#shuttleRoute" />
                          </animateMotion>
                          <circle r="6" fill="#f59e0b" />
                           <rect x="-20" y="-35" width="40" height="20" rx="4" fill="white" stroke="#e2e8f0" />
                          <text x="0" y="-22" textAnchor="middle" className="text-[10px] font-bold fill-amber-700">29A-987.65</text>
                      </g>
                  </svg>
              </div>
              
              <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                          <Bus size={20} />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Tổng xe hoạt động</p>
                          <p className="font-bold text-slate-800 text-lg">4/5</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Users size={20} />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Khách trên xe</p>
                          <p className="font-bold text-slate-800 text-lg">42</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                          <History size={20} />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Đúng giờ</p>
                          <p className="font-bold text-slate-800 text-lg">98%</p>
                      </div>
                  </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                          <AlertTriangle size={20} />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Cảnh báo</p>
                          <p className="font-bold text-slate-800 text-lg">0</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShuttleManager;