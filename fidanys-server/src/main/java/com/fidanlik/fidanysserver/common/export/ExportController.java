package com.fidanlik.fidanysserver.common.export;

import com.fidanlik.fidanysserver.accounting.repository.TransactionRepository;
import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.customer.service.CustomerService;
import com.fidanlik.fidanysserver.expense.service.ExpenseService;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.repository.PlantTypeRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.fidan.service.ProductionBatchService;
import com.fidanlik.fidanysserver.goodsreceipt.service.GoodsReceiptService;
import com.fidanlik.fidanysserver.inflation.service.InflationService;
import com.fidanlik.fidanysserver.invoicing.service.InvoiceService;
import com.fidanlik.fidanysserver.order.service.OrderService;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository;
import com.fidanlik.fidanysserver.supplier.service.SupplierService;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import com.fidanlik.fidanysserver.warehouse.service.WarehouseService;
import com.fidanlik.fidanysserver.stock.dto.StockSummaryDTO;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.warehouse.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final PlantService plantService;
    private final WarehouseService warehouseService;
    private final CustomerService customerService;
    private final SupplierService supplierService;
    private final ExpenseService expenseService;
    private final InflationService inflationService;
    private final OrderService orderService;
    private final CustomerRepository customerRepository;
    private final GoodsReceiptService goodsReceiptService;
    private final SupplierRepository supplierRepository;
    private final ProductionBatchRepository productionBatchRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductionBatchService productionBatchService;
    private final PlantTypeRepository plantTypeRepository;
    private final StockService stockService;
    private final TransactionRepository transactionRepository;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    @GetMapping("/{format}")
    public ResponseEntity<InputStreamResource> exportData(
            @PathVariable String format,
            @RequestParam String entity,
            @AuthenticationPrincipal User currentUser) throws IOException {

        String tenantId = currentUser.getTenantId();
        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        String reportTitle = "";

        switch (entity.toLowerCase()) {
            case "plants":
                reportTitle = "Fidan Kimlik Raporu";
                headers = List.of("Fidan Türü", "Fidan Çeşidi", "Anaç", "Boy", "Yaş", "Arazi");
                plantService.getAllPlantsByTenant(tenantId).forEach(plant -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("Fidan Türü", plant.getPlantType() != null ? plant.getPlantType().getName() : "");
                    row.put("Fidan Çeşidi", plant.getPlantVariety() != null ? plant.getPlantVariety().getName() : "");
                    row.put("Anaç", plant.getRootstock() != null ? plant.getRootstock().getName() : "");
                    row.put("Boy", plant.getPlantSize() != null ? plant.getPlantSize().getName() : "");
                    row.put("Yaş", plant.getPlantAge() != null ? plant.getPlantAge().getName() : "");
                    row.put("Arazi", plant.getLand() != null ? plant.getLand().getName() : "");
                    data.add(row);
                });
                break;

            case "warehouses":
                reportTitle = "Depo Raporu";
                headers = List.of("Depo Adı", "Adres");
                warehouseService.getAllWarehousesByTenant(tenantId).forEach(warehouse -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("Depo Adı", warehouse.getName());
                    row.put("Adres", warehouse.getAddress());
                    data.add(row);
                });
                break;

            case "customers":
                reportTitle = "Müşteri Raporu";
                headers = List.of("Adı", "Soyadı", "Firma Adı", "Telefon", "E-posta", "Adres");
                customerService.getAllCustomersByTenant(tenantId).forEach(customer -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("Adı", customer.getFirstName());
                    row.put("Soyadı", customer.getLastName());
                    row.put("Firma Adı", customer.getCompanyName());
                    row.put("Telefon", customer.getPhone());
                    row.put("E-posta", customer.getEmail());
                    row.put("Adres", customer.getAddress());
                    data.add(row);
                });
                break;

            case "suppliers":
                reportTitle = "Tedarikçi Raporu";
                headers = List.of("Tedarikçi Adı", "Yetkili Kişi", "Telefon", "E-posta", "Adres");
                supplierService.getAllSuppliersByTenant(tenantId).forEach(supplier -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("Tedarikçi Adı", supplier.getName());
                    row.put("Yetkili Kişi", supplier.getContactPerson());
                    row.put("Telefon", supplier.getPhone());
                    row.put("E-posta", supplier.getEmail());
                    row.put("Adres", supplier.getAddress());
                    data.add(row);
                });
                break;

            case "expense-categories":
                reportTitle = "Gider Kategorileri Raporu";
                headers = List.of("Kategori Adı", "Açıklama");
                // Not: ExpenseService'inizde tüm kategorileri getiren bir metod olduğunu varsayıyoruz.
                // Metod adı farklıysa (örn: findAllCategoriesByTenant), lütfen güncelleyin.
                expenseService.getAllCategories(tenantId).forEach(category -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("Kategori Adı", category.getName());
                    row.put("Açıklama", category.getDescription());
                    data.add(row);
                });
                break;

            case "inflation-data":
                reportTitle = "Aylık Enflasyon Verileri Raporu";
                headers = List.of("Tarih", "Değer (%)");
                inflationService.getAllInflationData().forEach(inflation -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    // DÜZELTME: Tarih null ise programın çökmesini engelliyoruz.
                    if (inflation.getDate() != null) {
                        java.time.format.DateTimeFormatter formatter =
                                java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy", new java.util.Locale("tr"));
                        row.put("Tarih", inflation.getDate().format(formatter));
                    } else {
                        row.put("Tarih", "TANIMSIZ"); // veya "" boş bırakabilirsiniz.
                    }

                    row.put("Değer (%)", inflation.getValue());
                    data.add(row);
                });
                break;
            case "orders":
                reportTitle = "Sipariş Raporu";
                headers = List.of("Sipariş No", "Müşteri", "Sipariş Tarihi", "Durum", "Tutar");

                orderService.getAllOrdersByTenant(tenantId).forEach(order -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    String customerName = customerRepository.findById(order.getCustomerId())
                            .map(c -> c.getFirstName() + " " + c.getLastName())
                            .orElse("Müşteri Bulunamadı");

                    row.put("Sipariş No", order.getOrderNumber());
                    row.put("Müşteri", customerName);

                    if (order.getOrderDate() != null) {
                        java.time.format.DateTimeFormatter formatter =
                                java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
                        row.put("Sipariş Tarihi", order.getOrderDate().format(formatter));
                    } else {
                        row.put("Sipariş Tarihi", "");
                    }

                    row.put("Durum", order.getStatus() != null ? order.getStatus().name() : "Bilinmiyor");
                    row.put("Tutar", order.getTotalAmount());
                    data.add(row);
                });
                break;

            case "goods-receipts":
                reportTitle = "Mal Giriş Raporu";
                headers = List.of("İrsaliye No", "Kaynak", "Depo", "Tarih", "Tutar");

                goodsReceiptService.getAllGoodsReceiptsByTenant(tenantId).forEach(receipt -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    // Kaynağın adını belirle (Tedarikçi veya Üretim Partisi)
                    String sourceName;
                    if (receipt.getSourceType() == com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt.SourceType.SUPPLIER) {
                        sourceName = supplierRepository.findById(receipt.getSourceId())
                                .map(s -> "Tedarikçi: " + s.getName())
                                .orElse("Tedarikçi Bulunamadı");
                    } else if (receipt.getSourceType() == com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt.SourceType.PRODUCTION_BATCH) {
                        sourceName = productionBatchRepository.findById(receipt.getSourceId())
                                .map(b -> "Üretim: " + b.getBatchName())
                                .orElse("Üretim Partisi Bulunamadı");
                    } else {
                        sourceName = "Bilinmeyen Kaynak";
                    }

                    // Depo adını al
                    String warehouseName = warehouseRepository.findById(receipt.getWarehouseId())
                            .map(w -> w.getName())
                            .orElse("Depo Bulunamadı");

                    row.put("İrsaliye No", receipt.getReceiptNumber());
                    row.put("Kaynak", sourceName);
                    row.put("Depo", warehouseName);

                    if (receipt.getReceiptDate() != null) {
                        java.time.format.DateTimeFormatter formatter =
                                java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
                        row.put("Tarih", receipt.getReceiptDate().format(formatter));
                    } else {
                        row.put("Tarih", "");
                    }

                    row.put("Tutar", receipt.getTotalValue());
                    data.add(row);
                });
                break;

            case "stocks":
                reportTitle = "Stok Durum Raporu";
                headers = List.of("Fidan Türü", "Fidan Çeşidi", "Anaç", "Boy", "Yaş", "Depo", "Miktar");

                stockService.getStockSummary(tenantId).forEach(stockSummary -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    row.put("Fidan Türü", stockSummary.getPlantTypeName());
                    row.put("Fidan Çeşidi", stockSummary.getPlantVarietyName());
                    row.put("Anaç", stockSummary.getRootstockName());
                    row.put("Boy", stockSummary.getPlantSizeName());
                    row.put("Yaş", stockSummary.getPlantAgeName());
                    row.put("Depo", stockSummary.getWarehouseName());
                    row.put("Miktar", stockSummary.getTotalQuantity());
                    data.add(row);
                });
                break;

            case "production-batches":
                reportTitle = "Üretim Partileri Raporu";
                headers = List.of("Parti Adı", "Fidan Türü", "Durum", "Başlangıç Miktarı", "Mevcut Miktar", "Maliyet Havuzu");

                productionBatchService.getAllProductionBatches(tenantId).forEach(batch -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    String plantTypeName = plantTypeRepository.findById(batch.getPlantTypeId())
                            .map(pt -> pt.getName())
                            .orElse("Tür Bulunamadı");

                    row.put("Parti Adı", batch.getBatchName());
                    row.put("Fidan Türü", plantTypeName);
                    row.put("Durum", batch.getStatus() != null ? batch.getStatus().name() : "Bilinmiyor");
                    row.put("Başlangıç Miktarı", batch.getInitialQuantity());
                    row.put("Mevcut Miktar", batch.getCurrentQuantity());
                    row.put("Maliyet Havuzu", batch.getCostPool());
                    data.add(row);
                });
                break;

            case "customer-accounts":
                reportTitle = "Müşteri Cari Hesap Raporu";
                headers = List.of("Müşteri", "Toplam Borç", "Toplam Alacak", "Bakiye");

                // 1. Tenant'a ait tüm müşterileri çek
                customerRepository.findAllByTenantId(tenantId).forEach(customer -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    // 2. Her müşterinin tüm işlemlerini çek
                    List<com.fidanlik.fidanysserver.accounting.model.Transaction> transactions =
                            transactionRepository.findByCustomerIdAndTenantIdOrderByTransactionDateDesc(customer.getId(), tenantId);

                    BigDecimal totalDebit = BigDecimal.ZERO;
                    BigDecimal totalCredit = BigDecimal.ZERO;

                    // 3. Borç ve alacakları hesapla
                    for (com.fidanlik.fidanysserver.accounting.model.Transaction tx : transactions) {
                        if (tx.getType() == com.fidanlik.fidanysserver.accounting.model.Transaction.TransactionType.DEBIT) {
                            totalDebit = totalDebit.add(tx.getAmount());
                        } else if (tx.getType() == com.fidanlik.fidanysserver.accounting.model.Transaction.TransactionType.CREDIT) {
                            totalCredit = totalCredit.add(tx.getAmount());
                        }
                    }

                    // 4. Bakiyeyi hesapla (Borç - Alacak)
                    BigDecimal balance = totalDebit.subtract(totalCredit);

                    row.put("Müşteri", customer.getFirstName() + " " + customer.getLastName());
                    row.put("Toplam Borç", totalDebit);
                    row.put("Toplam Alacak", totalCredit);
                    row.put("Bakiye", balance);
                    data.add(row);
                });
                break;

            case "supplier-accounts":
                reportTitle = "Tedarikçi Cari Hesap Raporu";
                headers = List.of("Tedarikçi", "Toplam Alacak", "Toplam Borç (Ödenen)", "Bakiye");

                // 1. Tenant'a ait tüm tedarikçileri çek
                supplierRepository.findAllByTenantId(tenantId).forEach(supplier -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    // 2. Her tedarikçinin tüm işlemlerini çek
                    List<com.fidanlik.fidanysserver.accounting.model.Transaction> transactions =
                            transactionRepository.findBySupplierIdAndTenantIdOrderByTransactionDateDesc(supplier.getId(), tenantId);

                    BigDecimal totalCredit = BigDecimal.ZERO; // Tedarikçinin bizden alacağı
                    BigDecimal totalDebit = BigDecimal.ZERO;  // Bizim tedarikçiye ödediğimiz

                    // 3. Alacak ve borçları hesapla
                    for (com.fidanlik.fidanysserver.accounting.model.Transaction tx : transactions) {
                        if (tx.getType() == com.fidanlik.fidanysserver.accounting.model.Transaction.TransactionType.CREDIT) {
                            totalCredit = totalCredit.add(tx.getAmount());
                        } else if (tx.getType() == com.fidanlik.fidanysserver.accounting.model.Transaction.TransactionType.DEBIT) {
                            totalDebit = totalDebit.add(tx.getAmount());
                        }
                    }

                    // 4. Bakiyeyi hesapla (Alacak - Borç)
                    BigDecimal balance = totalCredit.subtract(totalDebit);

                    row.put("Tedarikçi", supplier.getName());
                    row.put("Toplam Alacak", totalCredit);
                    row.put("Toplam Borç (Ödenen)", totalDebit);
                    row.put("Bakiye", balance);
                    data.add(row);
                });
                break;

            case "invoices":
                reportTitle = "Fatura Raporu";
                headers = List.of("Fatura No", "Müşteri", "Oluşturma Tarihi", "Vade Tarihi", "Durum", "Tutar");

                invoiceService.getAllInvoices(tenantId).forEach(invoice -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    String customerName = customerRepository.findById(invoice.getCustomerId())
                            .map(c -> c.getFirstName() + " " + c.getLastName())
                            .orElse("Müşteri Bulunamadı");

                    java.time.format.DateTimeFormatter dateFormatter =
                            java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy");

                    row.put("Fatura No", invoice.getInvoiceNumber());
                    row.put("Müşteri", customerName);

                    row.put("Oluşturma Tarihi", invoice.getIssueDate() != null ? invoice.getIssueDate().format(dateFormatter) : "");
                    row.put("Vade Tarihi", invoice.getDueDate() != null ? invoice.getDueDate().format(dateFormatter) : "");

                    row.put("Durum", invoice.getStatus() != null ? invoice.getStatus().name() : "Bilinmiyor");
                    row.put("Tutar", invoice.getTotalAmount());
                    data.add(row);
                });
                break;

            case "payments":
                reportTitle = "Kasa ve Banka Hareketleri Raporu";
                headers = List.of("Tarih", "İşlem Tipi", "Açıklama", "Yöntem", "Tutar");

                paymentService.getAllPayments(tenantId).forEach(payment -> {
                    Map<String, Object> row = new LinkedHashMap<>();

                    java.time.format.DateTimeFormatter dateFormatter =
                            java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy");

                    // İşlem tipini Türkçeleştiriyoruz
                    String paymentType = "";
                    if (payment.getType() == com.fidanlik.fidanysserver.payment.model.Payment.PaymentType.COLLECTION) {
                        paymentType = "Tahsilat (Para Girişi)";
                    } else if (payment.getType() == com.fidanlik.fidanysserver.payment.model.Payment.PaymentType.PAYMENT) {
                        paymentType = "Tediye (Para Çıkışı)";
                    }

                    row.put("Tarih", payment.getPaymentDate() != null ? payment.getPaymentDate().format(dateFormatter) : "");
                    row.put("İşlem Tipi", paymentType);
                    row.put("Açıklama", payment.getDescription());
                    row.put("Yöntem", payment.getMethod() != null ? payment.getMethod().name() : "");
                    row.put("Tutar", payment.getAmount());
                    data.add(row);
                });
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        ByteArrayInputStream in;
        HttpHeaders httpHeaders = new HttpHeaders();
        String filename = entity + "-raporu." + format;
        httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename);

        if ("pdf".equalsIgnoreCase(format)) {
            in = exportService.generatePdf(reportTitle, headers, data);
            httpHeaders.setContentType(MediaType.APPLICATION_PDF);
        } else if ("csv".equalsIgnoreCase(format)) {
            in = exportService.generateCsv(headers, data);
            httpHeaders.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .headers(httpHeaders)
                .body(new InputStreamResource(in));
    }
}