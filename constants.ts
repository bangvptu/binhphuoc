
import { Vehicle, VehicleType, VehicleStatus, Booking, BookingStatus, User, Driver, DriverStatus, ShuttleBooking, ShuttleStatus } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Nguyễn Văn Quản',
  role: 'admin',
  department: 'Vận hành'
};

// --- SHUTTLE CONFIGURATION ---
export const SHUTTLE_CONFIG = {
  PRICE_PER_SEAT: 150000,
  ROUTES: [
    { id: 'TB-BP', name: 'Trấn Biên ➔ Bình Phước', from: 'Trấn Biên', to: 'Bình Phước' },
    { id: 'BP-TB', name: 'Bình Phước ➔ Trấn Biên', from: 'Bình Phước', to: 'Trấn Biên' }
  ]
};

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Phạm Văn Tài',
    avatar: 'https://i.pravatar.cc/150?u=d1',
    phone: '0901.234.567',
    licenseClass: 'D',
    yearsExperience: 8,
    rating: 4.8,
    status: DriverStatus.READY,
    totalTrips: 1240
  },
  {
    id: 'd2',
    name: 'Lê Thanh Xế',
    avatar: 'https://i.pravatar.cc/150?u=d2',
    phone: '0909.888.777',
    licenseClass: 'E',
    yearsExperience: 12,
    rating: 4.9,
    status: DriverStatus.DRIVING,
    totalTrips: 2100
  },
  {
    id: 'd3',
    name: 'Trần Văn Mới',
    avatar: 'https://i.pravatar.cc/150?u=d3',
    phone: '0912.333.444',
    licenseClass: 'B2',
    yearsExperience: 2,
    rating: 4.5,
    status: DriverStatus.OFF_DUTY,
    totalTrips: 150
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'VinFast Lux A2.0',
    plate: '30H-123.45',
    type: VehicleType.SEDAN,
    seats: 5,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    fuelLevel: 85,
    mileage: 12500,
    features: ['Wifi', 'Nước uống', 'Thẻ ETC']
  },
  {
    id: 'v2',
    name: 'Toyota Fortuner',
    plate: '29A-987.65',
    type: VehicleType.SUV,
    seats: 7,
    status: VehicleStatus.IN_USE,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    fuelLevel: 40,
    mileage: 45200,
    features: ['Cốp rộng', 'Địa hình']
  },
  {
    id: 'v3',
    name: 'Ford Transit',
    plate: '29D-555.88',
    type: VehicleType.VAN,
    seats: 16,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
    fuelLevel: 90,
    mileage: 89000,
    features: ['Cho đoàn đông', 'Micro']
  },
  {
    id: 'v4',
    name: 'Mercedes S450',
    plate: '30K-999.99',
    type: VehicleType.LUXURY,
    seats: 5,
    status: VehicleStatus.MAINTENANCE,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    fuelLevel: 20,
    mileage: 5000,
    features: ['VIP', 'Ghế massage']
  },
  {
    id: 'v5',
    name: 'VinFast VF9',
    plate: '30E-686.86',
    type: VehicleType.SUV,
    seats: 7,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://images.unsplash.com/photo-1629896734739-8ae097cb0625?auto=format&fit=crop&w=800&q=80',
    fuelLevel: 95,
    mileage: 8000,
    features: ['Điện', 'Yên tĩnh', 'Cửa sổ trời']
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    vehicleId: 'v2',
    driverId: 'd2',
    userId: 'u2',
    userName: 'Trần Thị B',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    purpose: 'Gặp khách hàng KCN Bắc Thăng Long',
    destination: 'Đông Anh, Hà Nội',
    status: BookingStatus.IN_PROGRESS,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    estimatedCost: 500000,
    distanceKm: 45
  },
  {
    id: 'b2',
    vehicleId: 'v1',
    userId: 'u1',
    userName: 'Nguyễn Văn A',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    purpose: 'Đi công tác tỉnh',
    destination: 'Hải Phòng',
    status: BookingStatus.PENDING,
    createdAt: new Date().toISOString(),
    estimatedCost: 1200000
  },
  {
    id: 'b3',
    vehicleId: 'v3',
    driverId: 'd1',
    userId: 'u3',
    userName: 'Phòng Hành Chính',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 160000000).toISOString(),
    purpose: 'Đưa đón CBNV',
    destination: 'Hòa Lạc, Hà Nội',
    status: BookingStatus.COMPLETED,
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    estimatedCost: 800000,
    actualRevenue: 1000000,
    distanceKm: 80
  },
  {
    id: 'b4',
    isGuest: true,
    guestName: 'Michael Wong',
    guestPhone: '0988.555.123',
    pickupLocation: 'Sảnh Lobby Tòa nhà TechnoPark',
    vehicleTypeRequirement: VehicleType.LUXURY,
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    purpose: 'Đưa đón sân bay',
    destination: 'Sân bay Nội Bài',
    status: BookingStatus.PENDING,
    createdAt: new Date().toISOString(),
    estimatedCost: 650000
  }
];

export const MOCK_SHUTTLE_BOOKINGS: ShuttleBooking[] = [
  {
    id: 's1',
    guestName: 'Nguyễn Thị Lan',
    guestPhone: '0912.345.678',
    pickupLocation: 'Trấn Biên (Cổng chào)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00',
    paxCount: 2,
    status: ShuttleStatus.CONFIRMED,
    bookingTime: new Date(Date.now() - 86400000).toISOString(), // Booked yesterday
    isVIP: false
  },
  {
    id: 's2',
    guestName: 'Phạm Minh (VIP)',
    guestPhone: '0987.654.321',
    pickupLocation: 'Bình Phước (Ngã 4)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00',
    paxCount: 4,
    status: ShuttleStatus.REGISTERED,
    bookingTime: new Date(Date.now() - 43200000).toISOString(), // Booked 12h ago
    isVIP: true // VIP should priority even if booked later than some
  },
  {
    id: 's3',
    guestName: 'Nhóm Sale BĐS',
    guestPhone: '0909.000.111',
    pickupLocation: 'Trấn Biên',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00',
    paxCount: 10, 
    status: ShuttleStatus.REGISTERED,
    bookingTime: new Date(Date.now() - 172800000).toISOString(), // Booked 2 days ago (Early bird)
    isVIP: false
  },
  {
    id: 's4',
    guestName: 'Lê Văn C',
    guestPhone: '0911.222.333',
    pickupLocation: 'Bình Phước',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00',
    paxCount: 1,
    status: ShuttleStatus.PICKED_UP,
    bookingTime: new Date(Date.now() - 86400000).toISOString(),
    isVIP: false
  },
  {
    id: 's5',
    guestName: 'Hoàng Tùng (Trễ)',
    guestPhone: '0999.888.777',
    pickupLocation: 'Trấn Biên',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00',
    paxCount: 5, 
    status: ShuttleStatus.REGISTERED,
    bookingTime: new Date().toISOString(), // Just booked now
    isVIP: false
  }
];
