import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrdersTable } from '../../components/admin/OrdersTable';
import { OrderDetailModal } from '../../components/admin/OrderDetailModal';
import { EditAddressModal } from '../../components/admin/EditAddressModal';
import { SendTrackingEmailModal } from '../../components/admin/SendTrackingEmailModal';
import { CreateOrderModal } from '../../components/admin/CreateOrderModal';
import { fetchOrders, generateTrackingLink } from '../../services/api';
import { OrderItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Submodals for Manual Order, Address Edit, and Email Sending
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editAddressOrder, setEditAddressOrder] = useState<OrderItem | null>(null);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [emailOrder, setEmailOrder] = useState<OrderItem | null>(null);

  const loadOrders = useCallback(async (page = 1, search = searchQuery, status = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await fetchOrders({
        page,
        limit: 10,
        search,
        status,
      });
      setOrders(res.orders);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    loadOrders(1, query, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    loadOrders(1, searchQuery, status);
  };

  const handlePageChange = (newPage: number) => {
    loadOrders(newPage);
  };

  const handleGenerateTracking = async (order: OrderItem) => {
    try {
      await generateTrackingLink(order.id);
      loadOrders(pagination.page);
    } catch (err) {
      alert('Failed to generate tracking link');
    }
  };

  const handleSendEmailPrompt = (order: OrderItem) => {
    setEmailOrder(order);
    setIsSendEmailModalOpen(true);
  };

  const handleEditAddressPrompt = (order: OrderItem) => {
    setEditAddressOrder(order);
    setIsEditAddressOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ShopifyStore Orders</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage live customer orders, update delivery addresses, and dispatch tracking emails.
            </p>
          </div>
          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-sm"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span>+ Create Manual Order</span>
            </Button>
          </div>
        </div>

        <OrdersTable
          orders={orders}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onViewOrder={(order) => {
            setSelectedOrder(order);
            setIsModalOpen(true);
          }}
          onGenerateTracking={handleGenerateTracking}
          onSendEmail={handleSendEmailPrompt}
          onEditAddress={handleEditAddressPrompt}
          isLoading={isLoading}
        />
      </div>

      {/* Main Order Details Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderUpdated={() => loadOrders(pagination.page)}
      />

      {/* Create Manual Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={() => {
          loadOrders(1);
        }}
      />

      {/* Edit Address Modal */}
      <EditAddressModal
        order={editAddressOrder}
        isOpen={isEditAddressOpen}
        onClose={() => {
          setIsEditAddressOpen(false);
          setEditAddressOrder(null);
        }}
        onAddressUpdated={() => {
          loadOrders(pagination.page);
        }}
      />

      {/* Send Email Modal */}
      <SendTrackingEmailModal
        order={emailOrder}
        isOpen={isSendEmailModalOpen}
        onClose={() => {
          setIsSendEmailModalOpen(false);
          setEmailOrder(null);
        }}
        onSuccess={() => {
          loadOrders(pagination.page);
        }}
      />
    </AdminLayout>
  );
};

