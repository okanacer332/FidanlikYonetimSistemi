package com.fidanlik.fidanysserver.stock.controller;

import com.fidanlik.fidanysserver.stock.dto.StockSummaryDTO;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    /**
     * Tüm stok kayıtlarını listeler.
     * ADMIN, WAREHOUSE_STAFF ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Stok listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<List<Stock>> getAllStocks(@AuthenticationPrincipal User authenticatedUser) {
        List<Stock> stocks = stockService.getAllStocksByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(stocks);
    }

    /**
     * ID'ye göre tek bir stok kaydını getirir.
     * ADMIN, WAREHOUSE_STAFF ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param id Stok ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Bulunan stok nesnesi.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<Stock> getStockById(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Stock stock = stockService.getStockByIdAndTenantId(id, authenticatedUser.getTenantId());
        return ResponseEntity.ok(stock);
    }

    /**
     * Yeni bir stok kaydı oluşturur veya mevcut stoğu günceller.
     * Sadece ADMIN ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param stock Stok bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return HTTP 501 Not Implemented (Servis implementasyonu gerekiyor).
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Stock> createOrUpdateStock(@RequestBody Stock stock, @AuthenticationPrincipal User authenticatedUser) {
        // TODO: Gelen 'stock' nesnesine göre servis katmanında stok oluşturma/güncelleme mantığı implemente edilmeli.
        // Örnek: Stock updatedStock = stockService.changeStock(stock, authenticatedUser.getTenantId());
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    /**
     * Mevcut bir stok kaydını günceller.
     * Sadece ADMIN ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param id Stok ID'si.
     * @param stock Güncelleme bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return HTTP 501 Not Implemented (Servis implementasyonu gerekiyor).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Stock> updateStock(@PathVariable String id, @RequestBody Stock stock, @AuthenticationPrincipal User authenticatedUser) {
        // TODO: Servis katmanında stok güncelleme mantığı implemente edilmeli.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    /**
     * Bir stok kaydını siler.
     * Sadece ADMIN ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param id Stok ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return HTTP 501 Not Implemented (Servis implementasyonu gerekiyor).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Void> deleteStock(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        // TODO: Servis katmanında stok silme mantığı implemente edilmeli.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    /**
     * Kritik seviyedeki stokların özetini ve sayımını içeren raporları getirir.
     * ADMIN, WAREHOUSE_STAFF ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Stok özet listesi.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<List<StockSummaryDTO>> getStockSummary(@AuthenticationPrincipal User authenticatedUser) {
        List<StockSummaryDTO> summary = stockService.getStockSummary(authenticatedUser.getTenantId());
        return ResponseEntity.ok(summary);
    }
}