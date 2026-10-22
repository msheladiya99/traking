import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { OrderItem } from '../../types';
import { sendTrackingEmail } from '../../services/api';
import { Mail, CheckCircle2, AlertCircle, MapPin, Package, ExternalLink } from 'lucide-react';

interface SendTrackingEmailModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendTrackingEmailModal: React.FC<SendTrackingEmailModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (order) {
      setRecipientEmail(order.email || '');
      setStatusMessage(null);
    }
  }, [order, isOpen]);

  if (!order) return null;

  const trackingUrl = order.tracking_token
    ? `${window.location.origin}/track/${order.tracking_token}`
    : '';

  const addressFormatted = order.address || order.city
    ? `${order.address || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pin || ''}`.replace(/^, | , | - $/g, '').trim()
    : 'No address provided';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await sendTrackingEmail(order.id, recipientEmail.trim());
      setStatusMessage({
        type: 'success',
        text: res.message || `Tracking email successfully sent to ${recipientEmail}!`,
      });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to send tracking email. Please check SMTP settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Tracking Email - Order #${order.orderId}`}>
      <form onSubmit={handleSend} className="space-y-4">
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Email Preview Info */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-800 font-bold border-b border-slate-200/60 pb-2">
            <Package className="h-4 w-4 text-brand-600" />
            <span>EMAIL CONTENT PREVIEW</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block">Customer Name</span>
              <span className="font-semibold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Bill Amount</span>
              <span className="font-bold text-slate-900">₹{order.total_amount}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1 text-slate-500 mb-0.5">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              <span>Delivery Address Sent in Email:</span>
            </div>
            <p className="font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              {addressFormatted}
            </p>
          </div>

          {trackingUrl && (
            <div>
              <span className="text-slate-500 block mb-0.5">Tracking Link:</span>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-brand-700 underline flex items-center gap-1 hover:text-brand-900 break-all"
              >
                <span>{trackingUrl}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Recipient Input */}
        <div>
          <Input
            label="Send Mail To (Recipient Email)"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="recipient@example.com"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Default is the customer email. You can manually enter any destination email address to test or forward the tracking link.
          </p>
        </div>

        <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            <Mail className="h-4 w-4" />
            <span>Send Email Now</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
