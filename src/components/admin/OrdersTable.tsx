import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Link2, 
  Copy, 
  ExternalLink, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Filter,
  Mail,
  Edit2
} from 'lucide-react';
import { OrderItem } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

interface OrdersTableProps {
  orders: OrderItem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (newPage: number) => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onViewOrder: (order: OrderItem) => void;
  onGenerateTracking: (order: OrderItem) => void;
  onSendEmail: (order: OrderItem) => void;
  onEditAddress?: (order: OrderItem) => void;
  isLoading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  pagination,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onViewOrder,
  onGenerateTracking,
  onSendEmail,
  onEditAddress,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const handleCopyLink = (token: string, orderId: string) => {
    const appUrl = window.location.origin;
    const url = `${appUrl}/track/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return `₹${val}`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const datePart = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart}`;
    } catch (e) {
      return isoStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="warning">Out For Delivery</Badge>;
      case 'ORDER_PLACED':
        return <Badge variant="info">Order Placed</Badge>;
      case 'PICKED_UP':
        return <Badge variant="purple">Picked Up</Badge>;
      case 'MUMBAI_HUB':
        return <Badge variant="purple">Mumbai Hub</Badge>;
      case 'THANE_HUB':
        return <Badge variant="purple">Thane Hub</Badge>;
      case 'BHIWANDI_HUB':
        return <Badge variant="purple">Bhiwandi Hub</Badge>;
      case 'NEAREST_HUB':
        return <Badge variant="purple">Nearest Hub</Badge>;
      default:
        return <Badge variant="purple">In Transit</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Controls Bar */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search by customer, email, order ID, city or token..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              onStatusFilterChange(e.target.value);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Orders</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="tracking_active">Tracking Enabled</option>
            <option value="tracking_inactive">Tracking Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200/80">
            <tr>
              <th className="px-6 py-3.5">Order ID</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">City</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Order Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Tracking Link</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading MongoDB orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                  No orders found matching search or filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition duration-150">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    #{order.orderId}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.email}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.city || '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatAmount(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {formatDate(order.order_time)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.currentStatus)}
                  </td>
                  <td className="px-6 py-4">
                    {order.tracking_token ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                          {order.tracking_token}
                        </span>
                        <button
                          onClick={() => handleCopyLink(order.tracking_token!, order.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Copy Link"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={`/track/${order.tracking_token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-brand-600 transition"
                          title="Open Public Tracking Page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not generated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>

                      {onEditAddress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditAddress(order)}
                          title="Edit Delivery Address"
                          className="text-slate-600 hover:text-brand-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Address</span>
                        </Button>
                      )}

                      {!order.tracking_token ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onGenerateTracking(order)}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate</span>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onSendEmail(order)}
                            title="Send Tracking Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Send Mail</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onViewOrder(order)}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            <span>Manage</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Showing Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
          <strong className="text-slate-800">{pagination.totalPages}</strong> ({pagination.total} total orders)
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
