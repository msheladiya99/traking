import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  ShieldOff, 
  Package, 
  User, 
  MapPin, 
  Truck,
  Mail,
  Edit2
} from 'lucide-react';
import { OrderItem } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { generateTrackingLink, toggleTracking } from '../../services/api';
import { EditAddressModal } from './EditAddressModal';
import { SendTrackingEmailModal } from './SendTrackingEmailModal';

interface OrderDetailModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isSendMailOpen, setIsSendMailOpen] = useState(false);

  if (!order) return null;

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
      onOrderUpdated();
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
      onOrderUpdated();
    } catch (err) {
      alert('Failed to update tracking state');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Order #${order.orderId}`}>
        <div className="space-y-6">
          {/* ORDER INFORMATION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
              <Package className="h-4 w-4 text-brand-600" />
              <span>ORDER INFORMATION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Order ID</span>
                <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Order Date</span>
                <span className="font-medium text-slate-900">
                  {new Date(order.order_time).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Order Amount</span>
                <span className="font-bold text-slate-900">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER INFORMATION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
              <User className="h-4 w-4 text-brand-600" />
              <span>CUSTOMER INFORMATION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <span className="font-medium text-slate-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="font-medium text-slate-900 break-all">{order.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="font-medium text-slate-900">{order.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* DELIVERY INFORMATION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>DELIVERY ADDRESS</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditAddressOpen(true)}
                className="py-1 px-2.5 text-xs h-7"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                <span>Edit Address</span>
              </Button>
            </div>
            <div className="text-xs space-y-1 bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 text-sm">{order.address || 'No street address provided'}</p>
              <p className="text-slate-700 font-medium">
                {order.city ? `${order.city}, ` : ''}{order.state} - {order.pin}
              </p>
            </div>
          </div>

          {/* TRACKING INFORMATION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <Truck className="h-4 w-4 text-brand-600" />
                <span>TRACKING INFORMATION</span>
              </div>
              {order.tracking_enabled ? (
                <Badge variant="success">Tracking Enabled</Badge>
              ) : (
                <Badge variant="warning">Tracking Disabled</Badge>
              )}
            </div>

            {order.tracking_token ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Tracking Token</span>
                  <span className="font-mono font-bold text-slate-800">{order.tracking_token}</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Public Tracking Link</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={trackingUrl}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-700 select-all"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-none justify-center">
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                      <a href={trackingUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex">
                        <Button variant="primary" size="sm" className="w-full justify-center">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="pt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setIsSendMailOpen(true)} 
                      className="w-full sm:w-auto justify-center bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100"
                    >
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      <span className="whitespace-nowrap">Send Email to Customer / Manual Email</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-500 block">Current Status</span>
                    <span className="font-semibold text-brand-700">{order.currentStatusLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Delivery</span>
                    <span className="font-semibold text-slate-800">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">No tracking link generated for this order yet.</p>
                <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={isGenerating}>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Tracking Link</span>
                </Button>
              </div>
            )}
          </div>

          {/* CONTROLS & ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {order.tracking_token && (
              order.tracking_enabled ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleToggleState(false)}
                  isLoading={isToggling}
                >
                  <ShieldOff className="h-4 w-4" />
                  <span>Disable Tracking</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleToggleState(true)}
                  isLoading={isToggling}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Enable Tracking</span>
                </Button>
              )
            )}

            <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto justify-center ml-auto">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Address Submodal */}
      <EditAddressModal
        order={order}
        isOpen={isEditAddressOpen}
        onClose={() => setIsEditAddressOpen(false)}
        onAddressUpdated={() => {
          onOrderUpdated();
        }}
      />

      {/* Send Email Submodal */}
      <SendTrackingEmailModal
        order={order}
        isOpen={isSendMailOpen}
        onClose={() => setIsSendMailOpen(false)}
        onSuccess={() => {
          onOrderUpdated();
        }}
      />
    </>
  );
};

