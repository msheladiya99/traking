import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { OrderItem } from '../../types';
import { updateOrderAddress } from '../../services/api';
import { MapPin, User, Mail, Phone, IndianRupee, CheckCircle2 } from 'lucide-react';

interface EditAddressModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddressUpdated: (updatedOrder: OrderItem) => void;
}

export const EditAddressModal: React.FC<EditAddressModalProps> = ({
  order,
  isOpen,
  onClose,
  onAddressUpdated,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    total_amount: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || `${order.first_name || ''} ${order.last_name || ''}`.trim(),
        email: order.email || '',
        phone: order.phone || '',
        address: order.address || '',
        city: order.city || '',
        state: order.state || 'Gujarat',
        pin: order.pin || '',
        total_amount: order.total_amount || '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim() || !formData.city.trim()) {
      setError('Street address and City are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateOrderAddress(order.id, formData);
      setSuccess(true);
      setTimeout(() => {
        onAddressUpdated(updated);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Delivery Address - Order #${order.orderId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Delivery address updated successfully!</span>
          </div>
        )}

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-2">
          <p className="text-xs text-slate-500 font-medium">
            Updating this address will update MongoDB and the live customer tracking link as well as emails sent to the customer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Customer Full Name"
            icon={<User className="h-4 w-4" />}
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />
          <Input
            label="Customer Email"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="customer@example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            icon={<Phone className="h-4 w-4" />}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Order Amount (₹)"
            icon={<IndianRupee className="h-4 w-4" />}
            value={formData.total_amount}
            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            placeholder="1999"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Street Address / House / Landmark
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <MapPin className="h-4 w-4" />
            </div>
            <textarea
              rows={2}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder-slate-400 transition duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Flat 402, Royal Residency, VIP Road"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. Surat"
            required
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="e.g. Gujarat"
            required
          />
          <Input
            label="PIN Code"
            value={formData.pin}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
            placeholder="e.g. 395007"
            required
          />
        </div>

        <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
