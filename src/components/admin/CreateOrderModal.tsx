import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createManualOrder } from '../../services/api';
import { OrderItem } from '../../types';
import { PlusCircle, User, Mail, Phone, MapPin, IndianRupee, ShoppingBag, CheckCircle2 } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: OrderItem) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Gujarat',
    pin: '',
    total_amount: '1999',
    product_name: 'Premium Ghaghra Choli',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderItem | null>(null);

  const resetForm = () => {
    setFormData({
      orderId: '',
      customerName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'Gujarat',
      pin: '',
      total_amount: '1999',
      product_name: 'Premium Ghaghra Choli',
    });
    setError(null);
    setSuccessOrder(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim()) {
      setError('Please fill in Customer Name, Email, Address, and City.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newOrder = await createManualOrder(formData);
      setSuccessOrder(newOrder);
      onOrderCreated(newOrder);
    } catch (err: any) {
      setError(err.message || 'Failed to create order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Manual Customer Order">
      {successOrder ? (
        <div className="space-y-4 py-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-emerald-900">Order #{successOrder.orderId} Created Successfully!</p>
              <p className="text-slate-600 font-normal">
                Tracking link and timeline have been automatically generated for this customer.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{successOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="font-semibold text-slate-800 text-right">
                {successOrder.address}, {successOrder.city}, {successOrder.state} - {successOrder.pin}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tracking Token:</span>
              <span className="font-mono font-bold text-brand-700">{successOrder.tracking_token}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done & View Orders
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Order ID (Optional)"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              placeholder="e.g. VAS876543 (leave blank to auto-generate)"
            />
            <Input
              label="Customer Full Name"
              icon={<User className="h-4 w-4" />}
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Priya Patel"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="priya@example.com"
              required
            />
            <Input
              label="Phone Number"
              icon={<Phone className="h-4 w-4" />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Manual Delivery Address
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
                placeholder="Flat / House No, Building, Street, Area"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Surat"
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Gujarat"
              required
            />
            <Input
              label="PIN Code"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              placeholder="395001"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Product Name"
              icon={<ShoppingBag className="h-4 w-4" />}
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Premium Ghaghra Choli"
            />
            <Input
              label="Total Bill Amount (₹)"
              icon={<IndianRupee className="h-4 w-4" />}
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              placeholder="1999"
              required
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              <PlusCircle className="h-4 w-4" />
              <span>Create Order</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
