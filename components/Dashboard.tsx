import React, { useEffect, useState } from 'react';
import { Vehicle, Booking, BookingStatus, Driver, DriverStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';
import { analyzeFleetUsage } from '../services/geminiService';
import { Activity, Car, CalendarClock, BrainCircuit, Wallet, Users } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  drivers: Driver[];
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, bookings, drivers }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('Đang phân tích dữ liệu vận hành...');

  // Operational Stats
  const availableCars = vehicles.filter(v => v.status === 'Sẵn sàng').length;
  const activeTrips = bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length;
  const pendingTrips = bookings.filter(b => b.status === BookingStatus.PENDING).length;
  const readyDrivers = drivers.filter(d => d.status === DriverStatus.READY).length;

  // Financial Stats (Mock Calculation)
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0);
  const estimatedPipeline = bookings.reduce((sum, b) => sum + (b.estimatedCost || 0), 0);

  const revenueData = [
    { name: 'T2', rev: 12000000, cost: 8000000 },
    { name: 'T3', rev: 15000000, cost: 9500000 },
    { name: 'T4', rev: 11000000, cost: 7000000 },
    { name: 'T5', rev: 18000000, cost: 12000000 },
    { name: 'T6', rev: 22000000, cost: 14000000 },
    { name: 'T7', rev: 9000000, cost: 5000000 },
    { name: 'CN', rev: 5000000, cost: 3000000 },
  ];

  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await analyzeFleetUsage(bookings, { totalRevenue, readyDrivers });
      setAiAnalysis(result);
    };
    fetchAnalysis();
  }, [bookings, drivers]); // eslint-disable-line

  const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subValue && <p className={`text-xs mt-1 font-medium ${color}`}>{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon size={22} className={color} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Wallet} 
          label="Doanh thu tuần" 
          value={`${(totalRevenue/1000000).toFixed(1)}M ₫`} 
          subValue="+12% so với tuần trước"
          color="text-emerald-600"
        />
        <StatCard 
          icon={Car} 
          label="Xe Sẵn sàng" 
          value={`${availableCars}/${vehicles.length}`} 
          subValue={`${vehicles.length - availableCars} xe đang chạy/bảo trì`}
          color="text-blue-600"
        />
        <StatCard 
          icon={Users} 
          label="Tài xế Sẵn sàng" 
          value={`${readyDrivers}/${drivers.length}`} 
          subValue="Đội ngũ chuyên nghiệp"
          color="text-indigo-600"
        />
        <StatCard 
          icon={CalendarClock} 
          label="Yêu cầu chờ duyệt" 
          value={pendingTrips} 
          subValue="Cần xử lý ngay"
          color="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Hiệu quả Kinh doanh (7 ngày qua)</h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Đơn vị: VNĐ</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Area type="monotone" dataKey="rev" name="Doanh thu" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="cost" name="Chi phí" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden flex-1">
                <BrainCircuit className="absolute top-4 right-4 text-white/10" size={64} />
                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                         <SparklesIcon /> 
                         <span className="font-bold tracking-wider text-xs uppercase">AI Analysis</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                         <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-light">
                            {aiAnalysis}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                        <span>Cập nhật: Vừa xong</span>
                        <button className="hover:text-white transition-colors">Làm mới</button>
                    </div>
                </div>
            </div>
            
            {/* Mini Quick Actions */}
             <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-700 transition-colors">
                 <CalendarClock size={32} className="mb-2 opacity-80" />
                 <h4 className="font-bold">Lịch trình hôm nay</h4>
                 <p className="text-indigo-200 text-sm">{activeTrips} chuyến đang chạy</p>
             </div>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M5 3h4"/></svg>
)

export default Dashboard;