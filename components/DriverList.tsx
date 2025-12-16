import React from 'react';
import { Driver, DriverStatus } from '../types';
import { Phone, Star, Shield, Car, MoreVertical } from 'lucide-react';

interface DriverListProps {
  drivers: Driver[];
}

const DriverList: React.FC<DriverListProps> = ({ drivers }) => {
  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.READY: return 'bg-emerald-100 text-emerald-700';
      case DriverStatus.DRIVING: return 'bg-blue-100 text-blue-700';
      case DriverStatus.OFF_DUTY: return 'bg-slate-100 text-slate-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {drivers.map(driver => (
        <div key={driver.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <img 
                src={driver.avatar} 
                alt={driver.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{driver.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
                    Hạng {driver.licenseClass}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star size={12} className="fill-amber-500 mr-1" />
                    {driver.rating}
                  </div>
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone size={16} />
              </div>
              <span className="font-medium">{driver.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Shield size={16} />
              </div>
              <span>{driver.yearsExperience} năm kinh nghiệm</span>
            </div>
             <div className="flex items-center gap-3 text-sm text-slate-600">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Car size={16} />
              </div>
              <span>{driver.totalTrips} chuyến hoàn thành</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(driver.status)}`}>
              {driver.status}
            </span>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Xem lịch sử
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriverList;