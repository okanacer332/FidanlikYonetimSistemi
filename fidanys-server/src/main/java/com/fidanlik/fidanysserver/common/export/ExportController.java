package com.fidanlik.fidanysserver.common.export;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.service.CustomerService;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.service.SupplierService;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final PlantService plantService;
    private final WarehouseService warehouseService;
    private final CustomerService customerService;
    private final SupplierService supplierService;
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
                // ... (plants case'i aynı kalıyor)
                break;

            case "warehouses":
                // ... (warehouses case'i aynı kalıyor)
                break;

            case "customers":
                // ... (customers case'i aynı kalıyor)
                break;

            case "suppliers":
                // ... (suppliers case'i aynı kalıyor)
                break;

            // --- DEĞİŞİKLİK BURADA: payments case'i daha dayanıklı hale getirildi ---
            case "payments":
                reportTitle = "Kasa & Banka Hareketleri Raporu";
                headers = List.of("Tarih", "İşlem Tipi", "İlişkili Taraf", "Açıklama", "Ödeme Yöntemi", "Tutar");
                List<Payment> payments = paymentService.getAllPayments(tenantId);

                for (Payment payment : payments) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    String relatedName = "N/A";

                    if (payment.getRelatedEntityType() == Payment.RelatedEntityType.CUSTOMER) {
                        Optional<Customer> customerOpt = customerService.findCustomerById(payment.getRelatedId(), tenantId);
                        relatedName = customerOpt.map(c -> c.getFirstName() + " " + c.getLastName()).orElse("Silinmiş Müşteri");
                    } else if (payment.getRelatedEntityType() == Payment.RelatedEntityType.SUPPLIER) {
                        Optional<Supplier> supplierOpt = supplierService.findSupplierById(payment.getRelatedId(), tenantId);
                        relatedName = supplierOpt.map(Supplier::getName).orElse("Silinmiş Tedarikçi");
                    } else if (payment.getRelatedEntityType() == Payment.RelatedEntityType.EXPENSE) {
                        relatedName = "Gider Kaydı";
                    }

                    row.put("Tarih", payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : "");
                    row.put("İşlem Tipi", payment.getType() != null ? (payment.getType() == Payment.PaymentType.COLLECTION ? "Tahsilat" : "Tediye") : "");
                    row.put("İlişkili Taraf", relatedName);
                    row.put("Açıklama", payment.getDescription());
                    row.put("Ödeme Yöntemi", payment.getMethod() != null ? payment.getMethod().toString() : "");
                    row.put("Tutar", payment.getAmount());
                    data.add(row);
                }
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