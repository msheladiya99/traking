import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Truck, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ShieldOff,
  Edit2,
  Mail,
  Phone
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fetchOrderDetails, generateTrackingLink, toggleTracking } from '../../services/api';
import { OrderItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EditAddressModal } from '../../components/admin/EditAddressModal';
import { SendTrackingEmailModal } from '../../components/admin/SendTrackingEmailModal';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isSendMailOpen, setIsSendMailOpen] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await fetchOrderDetails(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <span className="text-slate-500 text-sm mt-4">Loading order details...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const trackingUrl = order.tracking_token
    ? `${window.location.origin}/track/${order.tracking_token}`
    : '';

  const handleCopy = () => {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateTrackingLink(order.id);
      await loadOrder();
    } catch (err) {
      alert('Failed to generate tracking link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleState = async (newState: boolean) => {
    setIsToggling(true);
    try {
      await toggleTracking(order.id, newState);
      await loadOrder();
    } catch (err) {
      alert('Failed to toggle tracking state');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link to="/admin/orders" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders List</span>
        </Link>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Order #{order.orderId}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.order_time).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {order.tracking_token && (
              order.tracking_enabled ? (
                <Button variant="danger" size="sm" onClick={() => handleToggleState(false)} isLoading={isToggling}>
                  <ShieldOff className="h-4 w-4" />
                  <span>Disable Tracking</span>
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => handleToggleState(true)} isLoading={isToggling}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Enable Tracking</span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order & Customer Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3">
                <Package className="h-5 w-5 text-brand-600" />
                <span>ORDER INFORMATION</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Order ID</span>
                  <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Total Amount</span>
                  <span className="font-bold text-slate-900">₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3">
                <User className="h-5 w-5 text-brand-600" />
                <span>CUSTOMER INFORMATION</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Name</span>
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Email</span>
                  <span className="font-medium text-slate-700">{order.email}</span>
                </div>
                {order.phone && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Phone</span>
                    <span className="font-medium text-slate-700">{order.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Tracking Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5 text-slate-900 font-bold">
                  <MapPin className="h-5 w-5 text-brand-600" />
                  <span>DELIVERY ADDRESS</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditAddressOpen(true)}
                  className="py-1 px-3 text-xs h-8"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>Edit Address</span>
                </Button>
              </div>
              <div className="text-sm space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-900">{order.address || 'No street address provided'}</p>
                <p className="text-slate-600">{order.city ? `${order.city}, ` : ''}{order.state} - {order.pin}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5 text-slate-900 font-bold">
                  <Truck className="h-5 w-5 text-brand-600" />
                  <span>TRACKING INFORMATION</span>
                </div>
                {order.tracking_enabled ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="warning">Disabled</Badge>
                )}
              </div>

              {order.tracking_token ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Tracking Token
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                      {order.tracking_token}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Public Link
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={trackingUrl}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700"
                      />
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <a href={trackingUrl} target="_blank" rel="noreferrer">
                        <Button variant="primary" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsSendMailOpen(true)}
                      className="w-full justify-center bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Send Tracking Email to Customer</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                        Estimated Delivery
                      </span>
                      <span className="font-bold text-slate-900">{order.estimatedDelivery}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                        Current Status
                      </span>
                      <span className="font-semibold text-brand-700">{order.currentStatusLabel}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-500">No tracking link generated yet.</p>
                  <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={isGenerating}>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Tracking Link</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Address Submodal */}
      <EditAddressModal
        order={order}
        isOpen={isEditAddressOpen}
        onClose={() => setIsEditAddressOpen(false)}
        onAddressUpdated={() => {
          loadOrder();
        }}
      />

      {/* Send Email Submodal */}
      <SendTrackingEmailModal
        order={order}
        isOpen={isSendMailOpen}
        onClose={() => setIsSendMailOpen(false)}
        onSuccess={() => {
          loadOrder();
        }}
      />
    </AdminLayout>
  );
};
