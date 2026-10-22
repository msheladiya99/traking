import { OrderItem, PublicOrderTracking, DashboardMetrics, AdminUser, AppSettings } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed.');
  }

  localStorage.setItem('admin_token', data.token);
  return { token: data.token, admin: data.admin };
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token');
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = localStorage.getItem('admin_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return res.ok && data.success ? data.admin : null;
  } catch (err) {
    return null;
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load dashboard metrics.');
  }
  return data.data;
}

export async function fetchOrders(params?: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: OrderItem[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch orders.');
  }

  return {
    orders: data.orders,
    pagination: data.pagination,
  };
}

export async function fetchOrderDetails(id: string): Promise<OrderItem> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Order not found.');
  }
  return data.order;
}

export async function generateTrackingLink(id: string): Promise<{ tracking_token: string; trackingUrl: string; tracking_enabled: boolean }> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/tracking`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate tracking link.');
  }
  return data.data;
}

export async function sendTrackingEmail(id: string, recipientEmail?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/send-email`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ recipientEmail }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to send tracking email.');
  }
  return data;
}

export async function updateOrderAddress(
  id: string,
  data: {
    address?: string;
    city?: string;
    state?: string;
    pin?: string;
    customerName?: string;
    email?: string;
    phone?: string;
    total_amount?: string;
  }
): Promise<OrderItem> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/address`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update order address.');
  }
  return json.order;
}

export async function createManualOrder(data: {
  orderId?: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  total_amount?: string;
  product_name?: string;
}): Promise<OrderItem> {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create manual order.');
  }
  return json.order;
}

export async function toggleTracking(id: string, enabled: boolean): Promise<{ tracking_enabled: boolean }> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/tracking`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ enabled }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update tracking state.');
  }
  return data.data;
}

export async function fetchPublicTracking(token: string): Promise<PublicOrderTracking> {
  const res = await fetch(`${API_BASE}/track/${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Tracking link not found or unavailable.');
  }
  return data.data;
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load settings.');
  }
  return data.data;
}

export async function updateSettings(settings: AppSettings): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update settings.');
  }
  return data.data;
}
