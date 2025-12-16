
export enum VehicleType {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  VAN = 'Van',
  LUXURY = 'Luxury'
}

export enum VehicleStatus {
  AVAILABLE = 'Sẵn sàng',
  IN_USE = 'Đang chạy',
  MAINTENANCE = 'Bảo trì'
}

export enum DriverStatus {
  READY = 'Sẵn sàng',
  DRIVING = 'Đang lái',
  OFF_DUTY = 'Nghỉ phép'
}

export enum BookingStatus {
  PENDING = 'Chờ duyệt',
  APPROVED = 'Đã duyệt',
  WAITING_FOR_DRIVER = 'Chờ tài xế',
  ASSIGNED = 'Đã điều xe',
  IN_PROGRESS = 'Đang chạy',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy'
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  licenseClass: string;
  yearsExperience: number;
  rating: number; // 0-5
  status: DriverStatus;
  totalTrips: number;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: VehicleType;
  seats: number;
  status: VehicleStatus;
  imageUrl: string;
  fuelLevel: number; // 0-100
  mileage: number;
  features: string[];
  maintenanceDue?: string; // ISO date
}

export interface Booking {
  id: string;
  vehicleId?: string; // Optional for Guest bookings initially
  vehicleTypeRequirement?: VehicleType; // Requirement for Guest
  driverId?: string; 
  userId?: string; // Optional for Guest
  userName?: string; // Optional for Guest (use guestName instead)
  
  // Guest specific fields
  isGuest?: boolean;
  guestName?: string;
  guestPhone?: string;
  pickupLocation?: string;

  stops?: string[]; // Array of waypoints/stops
  startTime: string; // ISO String
  endTime: string; // ISO String
  purpose: string;
  destination: string; // Represents the final destination
  status: BookingStatus;
  createdAt: string;
  estimatedCost: number; 
  actualRevenue?: number; 
  distanceKm?: number;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  department: string;
}

export interface AIReply {
  text: string;
  suggestedVehicleId?: string;
  analysis?: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Shuttle Bus Types
export enum ShuttleStatus {
  REGISTERED = 'Đăng ký',
  CONFIRMED = 'Đã xác nhận', // Called customer
  PICKED_UP = 'Đã đón',
  NO_SHOW = 'Hủy/Vắng'
}

export interface ShuttleBooking {
  id: string;
  guestName: string;
  guestPhone: string;
  pickupLocation: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "08:00", "09:00"
  paxCount: number;
  status: ShuttleStatus;
  notes?: string;
  bookingTime: string; // ISO string for First-Come-First-Served priority
  isVIP: boolean; // Priority flag
}
