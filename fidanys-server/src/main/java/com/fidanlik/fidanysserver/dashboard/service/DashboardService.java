package com.fidanlik.fidanysserver.dashboard.service;

import com.fidanlik.fidanysserver.dashboard.dto.DashboardSummaryDTO;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.role.model.Role;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.invoicing.model.Invoice; // Gerekli import
import com.fidanlik.fidanysserver.payment.model.Payment; // Gerekli import
import com.fidanlik.fidanysserver.accounting.model.Transaction; // Gerekli import


import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.payment.repository.PaymentRepository;
import com.fidanlik.fidanysserver.expense.repository.ExpenseCategoryRepository;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import com.fidanlik.fidanysserver.goodsreceipt.repository.GoodsReceiptRepository;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository; // Gerekli import
import com.fidanlik.fidanysserver.accounting.repository.TransactionRepository; // Gerekli import

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter; // Gerekli import
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MongoTemplate mongoTemplate;
    private final OrderRepository orderRepository;
    private final ExpenseRepository expenseRepository;
    private final StockRepository stockRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final PlantRepository plantRepository;
    private final SupplierRepository supplierRepository; // Yeni enjeksiyon
    private final TransactionRepository transactionRepository; // Yeni enjeksiyon


    public DashboardSummaryDTO getDashboardSummaryForUser(User currentUser) {
        // ... (Bu metodun içeriği aynı kalacak)
        String roleName = currentUser.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .findFirst()
                .orElse("DEFAULT");

        switch (roleName) {
            case "ADMIN":
                return getAdminSummary(currentUser.getTenantId());
            case "ACCOUNTANT":
                return getAccountantSummary(currentUser.getTenantId());
            case "WAREHOUSE_STAFF":
                return getWarehouseSummary(currentUser.getTenantId());
            default:
                return DashboardSummaryDTO.builder().build();
        }
    }

    private DashboardSummaryDTO getAdminSummary(String tenantId) {
        // ... (Bu metodun içeriği aynı kalacak)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        BigDecimal revenueLast30Days = orderRepository.findByTenantIdAndStatusInAndOrderDateAfter(
                        tenantId,
                        Arrays.asList(Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED),
                        thirtyDaysAgo
                ).stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate startOfMonth = YearMonth.now().atDay(1);
        BigDecimal expensesThisMonth = expenseRepository.findByTenantIdAndExpenseDateAfter(tenantId, startOfMonth)
                .stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrdersCount = orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.PREPARING);
        BigDecimal mockStockValue = new BigDecimal("1240500.00");

        List<DashboardSummaryDTO.DailyCashFlowDTO> monthlySalesTrend = Stream.iterate(YearMonth.now().minusMonths(5), ym -> ym.plusMonths(1))
                .limit(6)
                .map(yearMonth -> {
                    LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
                    LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59, 59);
                    BigDecimal monthlyRevenue = orderRepository.findByTenantIdAndStatusInAndOrderDateBetween(
                                    tenantId,
                                    Arrays.asList(Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED),
                                    start,
                                    end
                            ).stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return DashboardSummaryDTO.DailyCashFlowDTO.builder()
                            .date(yearMonth.toString())
                            .income(monthlyRevenue)
                            .outcome(BigDecimal.ZERO)
                            .build();
                }).collect(Collectors.toList());

        List<DashboardSummaryDTO.TopSellingPlantDTO> topSellingPlants = orderRepository.findByTenantIdAndStatusIn(
                        tenantId,
                        Arrays.asList(Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED)
                ).stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(Order.OrderItem::getPlantId, Collectors.summingInt(Order.OrderItem::getQuantity)))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry ->
                        plantRepository.findById(entry.getKey())
                                .map(plant -> DashboardSummaryDTO.TopSellingPlantDTO.builder()
                                        .plantName(plant.getPlantType().getName() + " - " + plant.getPlantVariety().getName())
                                        .totalSold(entry.getValue())
                                        .build())
                                .orElse(DashboardSummaryDTO.TopSellingPlantDTO.builder()
                                        .plantName("Fidan Bulunamadı")
                                        .totalSold(entry.getValue())
                                        .build())
                )
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .totalRevenueLast30Days(revenueLast30Days)
                .totalExpensesThisMonth(expensesThisMonth)
                .pendingOrdersCount(pendingOrdersCount)
                .totalStockValue(mockStockValue)
                .last7DaysCashFlow(monthlySalesTrend)
                .topSellingPlants(topSellingPlants)
                .build();
    }

    // --- GERÇEK VERİLERLE DOLDURULMUŞ METOT ---
    private DashboardSummaryDTO getAccountantSummary(String tenantId) {

        // 1. Vadesi Geçmiş Faturaların Toplam Tutarı
        LocalDate today = LocalDate.now();
        BigDecimal overdueTotal = invoiceRepository.findByTenantIdAndStatusNotAndDueDateBefore(
                        tenantId, Invoice.InvoiceStatus.PAID, today
                ).stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Ödenmemiş Tedarikçi Borçları Toplamı
        BigDecimal totalSupplierDebt = supplierRepository.findAllByTenantId(tenantId).stream()
                .map(supplier -> {
                    List<Transaction> transactions = transactionRepository.findBySupplierIdAndTenantIdOrderByTransactionDateDesc(supplier.getId(), tenantId);
                    BigDecimal credit = transactions.stream()
                            .filter(t -> t.getType() == Transaction.TransactionType.CREDIT)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal debit = transactions.stream()
                            .filter(t -> t.getType() == Transaction.TransactionType.DEBIT)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return credit.subtract(debit);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Giderlerin Kategorilere Göre Dağılımı
        Map<String, BigDecimal> expenseDist = expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId).stream()
                .filter(expense -> expense.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        expense -> expenseCategoryRepository.findById(expense.getCategoryId()).map(c -> c.getName()).orElse("Diğer"),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        // 4. Son 7 Günün Nakit Akışı (Tahsilat vs. Ödeme)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        Map<LocalDate, List<Payment>> paymentsByDate = paymentRepository.findByTenantIdAndPaymentDateAfter(tenantId, sevenDaysAgo.toLocalDate())
                .stream()
                .collect(Collectors.groupingBy(Payment::getPaymentDate));

        List<DashboardSummaryDTO.DailyCashFlowDTO> cashFlow = Stream.iterate(LocalDate.now().minusDays(6), date -> date.plusDays(1))
                .limit(7)
                .map(date -> {
                    BigDecimal income = paymentsByDate.getOrDefault(date, List.of()).stream()
                            .filter(p -> p.getType() == Payment.PaymentType.COLLECTION)
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal outcome = paymentsByDate.getOrDefault(date, List.of()).stream()
                            .filter(p -> p.getType() == Payment.PaymentType.PAYMENT)
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return DashboardSummaryDTO.DailyCashFlowDTO.builder()
                            .date(date.format(DateTimeFormatter.ofPattern("dd.MM")))
                            .income(income)
                            .outcome(outcome)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .overdueInvoicesTotal(overdueTotal)
                .unpaidSupplierDebt(totalSupplierDebt)
                .expenseDistribution(expenseDist)
                .last7DaysCashFlow(cashFlow)
                .build();
    }

    private DashboardSummaryDTO getWarehouseSummary(String tenantId) {
        // ... (Bu metodun içeriği aynı kalacak)
        long criticalStock = mongoTemplate.count(
                new org.springframework.data.mongodb.core.query.Query(Criteria.where("tenantId").is(tenantId).and("quantity").lt(10)),
                Stock.class
        );
        LocalDate today = LocalDate.now();
        long ordersToShip = orderRepository.countByTenantIdAndStatusAndExpectedDeliveryDate(
                tenantId, Order.OrderStatus.PREPARING, today
        );
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        long recentReceipts = goodsReceiptRepository.countByTenantIdAndReceiptDateAfter(tenantId, yesterday);
        List<DashboardSummaryDTO.StockByWarehouseDTO> stockDist = warehouseRepository.findAllByTenantId(tenantId).stream()
                .map(warehouse -> {
                    int totalPlantsInWarehouse = stockRepository.findByWarehouseIdAndTenantId(warehouse.getId(), tenantId)
                            .stream()
                            .mapToInt(Stock::getQuantity)
                            .sum();
                    return DashboardSummaryDTO.StockByWarehouseDTO.builder()
                            .warehouseName(warehouse.getName())
                            .plantCount(totalPlantsInWarehouse)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .criticalStockCount(criticalStock)
                .ordersToShipToday(ordersToShip)
                .recentGoodsReceiptsCount(recentReceipts)
                .stockDistribution(stockDist)
                .build();
    }
}