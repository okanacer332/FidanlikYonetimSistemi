'use client';

import * as React from 'react';
import { Stack, CircularProgress, Alert, IconButton, Tooltip, Button } from '@mui/material';
import { Plus as PlusIcon, Pencil as PencilIcon, Receipt as ReceiptIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useUser } from '@/hooks/use-user';
import type { Order, Customer, Warehouse, OrderStatus, Invoice } from '@/types/nursery';
import { useApiSWR } from '@/hooks/use-api-swr';
import { useNotifier } from '@/hooks/useNotifier';

// --- ORTAK BİLEŞENLER ---
import { PageHeader } from '@/components/common/PageHeader';
import { ActionableTable, type ColumnDef } from '@/components/common/ActionableTable';
import { StatusChip } from '@/components/common/StatusChip';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { InlineCreateForm } from '@/components/common/InlineCreateForm';

// --- MODÜLE ÖZEL FORM BİLEŞENLERİ ---
import { OrderCreateForm } from '@/components/dashboard/order/order-create-form';
import { OrderStatusUpdateForm } from '@/components/dashboard/order/order-status-update-form';

export interface OrderRow extends Order {
  customerName: string;
  warehouseName: string;
  isBilled: boolean;
}

const statusMap = {
  PREPARING: { label: 'Hazırlanıyor', color: 'warning' },
  SHIPPED: { label: 'Sevk Edildi', color: 'info' },
  DELIVERED: { label: 'Teslim Edildi', color: 'success' },
  CANCELED: { label: 'İptal Edildi', color: 'error' },
} as const;

const useOrders = () => useApiSWR<Order[]>('/orders');
const useCustomers = () => useApiSWR<Customer[]>('/customers');
const useWarehouses = () => useApiSWR<Warehouse[]>('/warehouses');
const useInvoices = () => useApiSWR<Invoice[]>('/invoices');

export default function Page(): React.JSX.Element {
    const notify = useNotifier();
    const { user: currentUser, isLoading: isUserLoading } = useUser();

    const { data: ordersData, error: ordersError, isLoading: isLoadingOrders, mutate: mutateOrders } = useOrders();
    const { data: customersData, error: customersError, isLoading: isLoadingCustomers } = useCustomers();
    const { data: warehousesData, error: warehousesError, isLoading: isLoadingWarehouses } = useWarehouses();
    const { data: invoicesData, error: invoicesError, isLoading: isLoadingInvoices, mutate: mutateInvoices } = useInvoices();

    // Tablo state'leri
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = React.useState<string>('orderDate');
    const [newlyAddedOrderId, setNewlyAddedOrderId] = React.useState<string | null>(null); // YENİ STATE

    const [isCreateFormOpen, setCreateFormOpen] = React.useState(false);
    const [isUpdateStatusModalOpen, setUpdateStatusModalOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);

    const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingWarehouses || isLoadingInvoices || isUserLoading;
    const error = ordersError || customersError || warehousesError || invoicesError;

    const canViewOrders = currentUser?.roles?.some(role => ['ADMIN', 'SALES', 'WAREHOUSE_STAFF'].includes(role.name));
    const canCreateOrders = currentUser?.roles?.some(role => ['ADMIN', 'SALES'].includes(role.name));
    const canUpdateOrderStatus = currentUser?.roles?.some(role => ['ADMIN', 'WAREHOUSE_STAFF', 'SALES'].includes(role.name));
    const canCreateInvoice = currentUser?.roles?.some(role => ['ADMIN', 'ACCOUNTANT'].includes(role.name));

    // DÜZELTME: handleSuccess artık yeni sipariş objesini alıyor
    const handleSuccess = (message: string, newOrder?: Order) => {
        setCreateFormOpen(false);
        setUpdateStatusModalOpen(false);
        notify.success(message);

        if (newOrder) {
            setNewlyAddedOrderId(newOrder.id);
            setTimeout(() => setNewlyAddedOrderId(null), 2000); // 2 saniye sonra vurguyu kaldır
        }

        mutateOrders();
        mutateInvoices();
    };

    const handleOpenUpdateStatus = (order: OrderRow) => {
        setSelectedOrder(order);
        setUpdateStatusModalOpen(true);
    };

    const handleRequestSort = React.useCallback((property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);


    const handleCreateInvoice = async (orderId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Oturum bulunamadı.');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/from-order/${orderId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Fatura oluşturulamadı.');
            }
            handleSuccess('Fatura başarıyla oluşturuldu!');
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Bir hata oluştu.');
        }
    };
    
    // ... (sortedAndFilteredData ve paginatedData aynı kalıyor) ...
    const sortedAndFilteredData = React.useMemo((): OrderRow[] => {
        const orders = ordersData || [];
        const customers = customersData || [];
        const warehouses = warehousesData || [];
        const invoices = invoicesData || [];
        
        const customerMap = new Map(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
        const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]));
        const invoicedOrderIds = new Set(invoices.map(inv => inv.orderId));
        
        const preparedData: OrderRow[] = orders.map(order => ({
            ...order,
            customerName: customerMap.get(order.customerId) || 'Bilinmeyen Müşteri',
            warehouseName: warehouseMap.get(order.warehouseId) || 'Bilinmeyen Depo',
            isBilled: invoicedOrderIds.has(order.id),
        }));

        const filtered = searchTerm
            ? preparedData.filter(row => 
                row.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : preparedData;
        
        const getSortableValue = (row: OrderRow, key: string) => {
            const keys = key.split('.');
            let value: any = row;
            for (const k of keys) { value = value?.[k]; }
            return value || '';
        };

        return [...filtered].sort((a, b) => {
            const aValue = getSortableValue(a, orderBy);
            const bValue = getSortableValue(b, orderBy);
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });

    }, [ordersData, customersData, warehousesData, invoicesData, searchTerm, order, orderBy]);
    
    const paginatedData = React.useMemo(() => {
      return sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedAndFilteredData, page, rowsPerPage]);

    const columns = React.useMemo<ColumnDef<OrderRow>[]>(() => [
        // ... (columns tanımı aynı kalıyor) ...
        { key: 'orderNumber', header: 'Sipariş No', sortable: true, getValue: (row) => row.orderNumber, render: (row) => row.orderNumber },
        { key: 'customerName', header: 'Müşteri', sortable: true, getValue: (row) => row.customerName, render: (row) => row.customerName },
        { key: 'totalAmount', header: 'Tutar', sortable: true, getValue: (row) => row.totalAmount, render: (row) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.totalAmount)},
        { key: 'orderDate', header: 'Sipariş Tarihi', sortable: true, getValue: (row) => dayjs(row.orderDate).valueOf(), render: (row) => dayjs(row.orderDate).format('DD/MM/YYYY')},
        { key: 'status', header: 'Durum', sortable: true, getValue: (row) => row.status, render: (row) => <StatusChip status={row.status} /> },
        {
            key: 'actions',
            header: 'İşlemler',
            align: 'right',
            render: (row) => {
                const canBeInvoiced = row.status === 'SHIPPED' || row.status === 'DELIVERED';
                const isInvoiceButtonDisabled = !canBeInvoiced || row.isBilled;
                let invoiceTooltipTitle = 'Fatura Oluştur';
                if (row.isBilled) { invoiceTooltipTitle = 'Bu sipariş zaten faturalanmış'; } 
                else if (!canBeInvoiced) { invoiceTooltipTitle = 'Sipariş sevk edilmeden faturalanamaz'; }
                return (
                    <Stack direction="row" spacing={0}>
                        {canUpdateOrderStatus && (<Tooltip title="Durumu Güncelle"><IconButton size="small" onClick={() => handleOpenUpdateStatus(row)}><PencilIcon /></IconButton></Tooltip>)}
                        {canCreateInvoice && (<Tooltip title={invoiceTooltipTitle}><span><IconButton size="small" disabled={isInvoiceButtonDisabled} onClick={() => handleCreateInvoice(row.id)}><ReceiptIcon /></IconButton></span></Tooltip>)}
                    </Stack>
                );
            },
        },
    ], [canUpdateOrderStatus, canCreateInvoice]);


    if (isLoading) return <Stack alignItems="center" justifyContent="center" sx={{minHeight: '80vh'}}><CircularProgress /></Stack>;
    if (error) return <Alert severity="error">{error.message}</Alert>;
    if (!canViewOrders) return <Alert severity="error">Bu sayfayı görüntüleme yetkiniz yok.</Alert>;
    
    return (
        <Stack spacing={3}>
            <AppBreadcrumbs />
            <PageHeader
                title="Sipariş Yönetimi"
                action={ canCreateOrders ? (
                    <Button startIcon={<PlusIcon />} variant="contained" onClick={() => setCreateFormOpen(prev => !prev)}>
                        Yeni Sipariş
                    </Button>
                ) : undefined }
            />

            <InlineCreateForm
                title="Yeni Sipariş Oluştur"
                isOpen={isCreateFormOpen}
                onClose={() => setCreateFormOpen(false)}
            >
                <OrderCreateForm
                    onSuccess={(newOrder) => handleSuccess("Sipariş başarıyla oluşturuldu!", newOrder)}
                    onCancel={() => setCreateFormOpen(false)}
                />
            </InlineCreateForm>
            
            <ActionableTable<OrderRow>
                columns={columns}
                rows={paginatedData}
                count={sortedAndFilteredData.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                searchTerm={searchTerm}
                onSearch={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                order={order}
                orderBy={orderBy}
                onSort={handleRequestSort}
                entity="orders"
                selectionEnabled={false}
                highlightedId={newlyAddedOrderId} // YENİ PROP
            />

            {selectedOrder && (
                <OrderStatusUpdateForm
                    open={isUpdateStatusModalOpen}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => handleSuccess("Sipariş durumu güncellendi!")}
                    orderId={selectedOrder.id}
                    currentStatus={selectedOrder.status}
                />
            )}
        </Stack>
    );
}