// fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/controller/StockController.java
package com.fidanlik.fidanysserver.stock.controller;

import com.fidanlik.fidanysserver.common.security.TenantAuthenticationToken;
import com.fidanlik.fidanysserver.stock.dto.StockSummaryDTO;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.service.StockService;
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
    @PreAuthorize("hasAuthority('stock:read') or hasAuthority('admin:read')")
    public ResponseEntity<List<Stock>> getAllStocks(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        List<Stock> stocks = stockService.getAllStocksByTenant(tenantId);
        return ResponseEntity.ok(stocks);
    }

    // **** BURASI GÜNCELLENDİ ****
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('stock:read') or hasAuthority('admin:read')")
    public ResponseEntity<Stock> getStockById(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        Stock stock = stockService.getStockByIdAndTenantId(id, tenantId); // Yeni metodu çağır
        return ResponseEntity.ok(stock);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('stock:create') or hasAuthority('admin:create')")
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        // createStock metodunu da tenantId alacak şekilde güncellemen gerekebilir
        // Şu anki StockService'de createStock yok, changeStock var.
        // changeStock metodu zaten tenantId alıyor, bu yüzden eğer bu endpointi kullanıyorsan,
        // createStock metodunu değiştirerek changeStock'u çağırmalısın.
        // Örnek olarak burada bir placeholder bırakıyorum:
        // Stock savedStock = stockService.createStock(stock, tenantId);
        // return new ResponseEntity<>(savedStock, HttpStatus.CREATED);
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED); // Geçici olarak
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('stock:update') or hasAuthority('admin:update')")
    public ResponseEntity<Stock> updateStock(@PathVariable String id, @RequestBody Stock stock, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        // updateStock metodunu da tenantId alacak şekilde güncellemen gerekebilir
        // StockService'de updateStock metodu mevcut ancak tenantId almıyor, onu da güncellemelisin.
        // Örnek: Stock updatedStock = stockService.updateStock(id, stock, tenantId);
        // return ResponseEntity.ok(updatedStock);
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED); // Geçici olarak
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('stock:delete') or hasAuthority('admin:delete')")
    public ResponseEntity<Void> deleteStock(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        // deleteStock metodunu da tenantId alacak şekilde güncellemen gerekebilir.
        // stockService.deleteStock(id, tenantId);
        // return ResponseEntity.noContent().build();
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED); // Geçici olarak
    }

    // Tenant bazında sayım metodlarını da TenantAuthenticationToken'dan tenantId alacak şekilde güncellemelisin.
    @GetMapping("/count/all")
    @PreAuthorize("hasAuthority('stock:read') or hasAuthority('admin:read')")
    public ResponseEntity<Long> countAllStocks(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        long count = stockService.countAllStocks(tenantId); // Bu metot StockService'te mevcut değil, eklemen gerekecek
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/low-stock")
    @PreAuthorize("hasAuthority('stock:read') or hasAuthority('admin:read')")
    public ResponseEntity<Long> countLowStockPlants(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        long count = stockService.countLowStockPlants(tenantId); // Bu metot StockService'te mevcut değil, eklemen gerekecek
        return ResponseEntity.ok(count);
    }


    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('stock:read') or hasAuthority('admin:read')")
    public ResponseEntity<List<StockSummaryDTO>> getStockSummary(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = ((TenantAuthenticationToken) userDetails).getTenantId();
        List<StockSummaryDTO> summary = stockService.getStockSummary(tenantId);
        return ResponseEntity.ok(summary);
    }
}