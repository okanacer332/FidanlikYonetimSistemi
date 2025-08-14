// fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/controller/StockController.java
package com.fidanlik.fidanysserver.stock.controller;

import com.fidanlik.fidanysserver.common.security.TenantAuthenticationToken;
import com.fidanlik.fidanysserver.stock.dto.StockSummaryDTO;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.user.model.User; // User modelini import et
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Stock>> getAllStocks(@AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        List<Stock> stocks = stockService.getAllStocksByTenant(tenantId);
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Stock> getStockById(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        Stock stock = stockService.getStockByIdAndTenantId(id, tenantId);
        return ResponseEntity.ok(stock);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock, @AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        // TODO: changeStock metodunu çağırarak stok oluşturma işlemini tamamlaman gerekebilir.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Stock> updateStock(@PathVariable String id, @RequestBody Stock stock, @AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        // TODO: updateStock metodunu çağırarak stok güncelleme işlemini tamamlaman gerekebilir.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteStock(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        // TODO: deleteStock metodunu çağırarak stok silme işlemini tamamlaman gerekebilir.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/count/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Long> countAllStocks(@AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        long count = stockService.countAllStocks(tenantId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/low-stock")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Long> countLowStockPlants(@AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        long count = stockService.countLowStockPlants(tenantId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<StockSummaryDTO>> getStockSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User authenticatedUser = (User) userDetails; // Hata burada düzeltildi
        String tenantId = authenticatedUser.getTenantId();
        List<StockSummaryDTO> summary = stockService.getStockSummary(tenantId);
        return ResponseEntity.ok(summary);
    }
}