'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';

import { OrdersTable, type OrderRow } from '@/components/dashboard/order/orders-table';
import { OrderCreateForm } from '@/components/dashboard/order/order-create-form';
import { OrderStatusUpdateForm } from '@/components/dashboard/order/order-status-update-form';
import type { Order, Customer, Warehouse, OrderStatus } from '@/types/nursery';

export default function Page(): React.JSX.Element {
    const { user: currentUser, isLoading: isUserLoading } = useUser();
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
    
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<{id: string; status: OrderStatus} | null>(null);

    const canViewOrders = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'SALES' || role.name === 'WAREHOUSE_STAFF'
    );
    const canCreateOrders = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'SALES'
    );
    const canUpdateOrderStatus = currentUser?.roles?.some(
        role => role.name === 'ADMIN' || role.name === 'WAREHOUSE_STAFF' || role.name === 'SALES'
    );

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Oturum bulunamadı.');
            setLoading(false);
            return;
        }

        try {
            const [ordersRes, customersRes, warehousesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (!ordersRes.ok || !customersRes.ok || !warehousesRes.ok) throw new Error('Veriler yüklenirken bir hata oluştu.');
            
            setOrders(await ordersRes.json());
            setCustomers(await customersRes.json());
            setWarehouses(await warehousesRes.json());

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (canViewOrders) {
            fetchData();
        } else if (!isUserLoading) {
            setLoading(false);
            setError('Siparişleri görüntüleme yetkiniz bulunmamaktadır.');
        }
    }, [canViewOrders, fetchData, isUserLoading]);
    
    const handleModalSuccess = () => {
        setCreateModalOpen(false);
        setUpdateStatusModalOpen(false);
        fetchData();
    };
    
    const handleOpenUpdateStatus = (orderId: string, currentStatus: OrderStatus) => {
        setSelectedOrder({ id: orderId, status: currentStatus });
        setUpdateStatusModalOpen(true);
    };

    const preparedData = React.useMemo((): OrderRow[] => {
        const customerMap = new Map(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
        const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]));

        return orders.map(order => ({
            ...order,
            customerName: customerMap.get(order.customerId) || 'Bilinmeyen Müşteri',
            warehouseName: warehouseMap.get(order.warehouseId) || 'Bilinmeyen Depo',
        })).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, customers, warehouses]);

    if (isUserLoading) {
        return <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>;
    }

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Sipariş Yönetimi</Typography>
                    <Typography variant="body1">
                        Müşteri siparişlerini oluşturun, görüntüleyin ve durumlarını yönetin.
                    </Typography>
                </Stack>
                <div>
                    {canCreateOrders && (
                        <Button
                            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                            variant="contained"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Yeni Sipariş Oluştur
                        </Button>
                    )}
                </div>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Stack sx={{ alignItems: 'center', mt: 3 }}><CircularProgress /></Stack>
            ) : canViewOrders ? (
                <OrdersTable
                    rows={preparedData}
                    onUpdateStatus={handleOpenUpdateStatus}
                    canUpdateStatus={!!canUpdateOrderStatus}
                />
            ) : null}
            
            <OrderCreateForm
                open={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleModalSuccess}
            />

            <OrderStatusUpdateForm
                open={isUpdateStatusModalOpen}
                onClose={() => setUpdateStatusModalOpen(false)}
                onSuccess={handleModalSuccess}
                orderId={selectedOrder?.id || null}
                currentStatus={selectedOrder?.status || null}
            />
        </Stack>
    );
}