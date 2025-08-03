package com.fidanlik.fidanysserver.common.export;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.service.CustomerService;
import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.service.SupplierService;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
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