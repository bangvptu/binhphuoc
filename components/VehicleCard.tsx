import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Users, Fuel, Gauge, MoreHorizontal, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onBook: (id: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onBook }) => {
  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE: return 'bg-green-100 text-green-700 border-green-200';
      case VehicleStatus.IN_USE: return 'bg-amber-100 text-amber-700 border-amber-200';
      case VehicleStatus.MAINTENANCE: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
     switch (status) {
      case VehicleStatus.AVAILABLE: return <CheckCircle2 size={14} />;
      case VehicleStatus.IN_USE: return <AlertCircle size={14} />;
      case VehicleStatus.MAINTENANCE: return <Wrench size={14} />;
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={vehicle.imageUrl} 
          alt={vehicle.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${getStatusColor(vehicle.status)}`}>
            {getStatusIcon(vehicle.status)}
            {vehicle.status}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
           <h3 className="text-white text-lg font-bold truncate">{vehicle.name}</h3>
           <p className="text-white/80 text-xs">{vehicle.plate}</p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg">
            <Users size={16} className="text-slate-400 mb-1" />
            <span className="text-xs font-medium text-slate-700">{vehicle.seats} chỗ</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg">
            <Fuel size={16} className="text-slate-400 mb-1" />
            <span className="text-xs font-medium text-slate-700">{vehicle.fuelLevel}%</span>
          </div>
           <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg">
            <Gauge size={16} className="text-slate-400 mb-1" />
            <span className="text-xs font-medium text-slate-700">{Math.floor(vehicle.mileage/1000)}k km</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {vehicle.features.slice(0, 3).map((feature, idx) => (
            <span key={idx} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2">
           <button 
            onClick={() => onBook(vehicle.id)}
            disabled={vehicle.status !== VehicleStatus.AVAILABLE}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              vehicle.status === VehicleStatus.AVAILABLE 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {vehicle.status === VehicleStatus.AVAILABLE ? 'Đặt Ngay' : 'Không Sẵn Sàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;