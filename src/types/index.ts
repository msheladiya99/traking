export interface TimelineStep {
  id: string;
  status: string;
  title: string;
  location?: string;
  description: string;
  date: string;
  isoDate: string;
  dayOffset: number;
  iconName: 'package' | 'truck' | 'warehouse' | 'map-pin' | 'check';
  completed: boolean;
  current: boolean;
  upcoming: boolean;
}

export interface CustomerData {
  name: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ProductData {
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
  category?: string;
}

export interface PaymentData {
  status: string;
  method: string;
}

export interface PublicOrderTracking {
  orderNumber: string;
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  currentStatus: string;
  currentStatusLabel: string;
  currentLocation: string;
  customer: CustomerData;
  product: ProductData;
  payment: PaymentData;
  timeline: TimelineStep[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  total_amount: string;
  order_time: string;
  tracking_token: string | null;
  tracking_enabled: boolean;
  tracking_created_at: string | null;
  currentStatus: string;
  currentStatusLabel: string;
  estimatedDelivery: string;
  trackingDetails?: PublicOrderTracking;
}

export interface DashboardMetrics {
  totalOrders: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  trackingActive: number;
}

export interface AdminUser {
  email: string;
}

export interface AppSettings {
  brandName: string;
  brandLogo: string;
  trackingPageTitle: string;
  estimatedDeliveryDays: number;
  trackingEnabledGlobal: boolean;
  hubsConfig: { key: string; label: string }[];
}

