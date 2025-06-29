package com.fidanlik.fidanysserver.stock.controller;

import com.fidanlik.fidanysserver.stock.dto.WastageRequest; // YENİ IMPORT
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // YENİ IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Stock> stocks = stockService.getAllStocksByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/movements/{plantId}")
    public ResponseEntity<List<StockMovement>> getStockMovements(@PathVariable String plantId, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<StockMovement> movements = stockService.getMovementsByPlant(plantId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(movements);
    }

    // YENİ ENDPOINT: Zayiat kaydı oluşturma
    @PostMapping("/wastage")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')") // Sadece ADMIN ve Depo Sorumlusu yetkisi olanlar zayiat girebilir.
    public ResponseEntity<Void> recordWastage(@RequestBody WastageRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        stockService.changeStock(
                request.getPlantId(),
                request.getWarehouseId(),
                -request.getQuantity(), // Stoktan düşüleceği için miktar negatif gönderilir
                StockMovement.MovementType.WASTAGE,
                null, // Zayiat kaydı doğrudan bir siparişe veya mal kabulüne bağlı olmayabilir
                request.getDescription(),
                authenticatedUser.getId(),
                authenticatedUser.getTenantId(),
                request.getProductionBatchId() // Üretim partisi bilgisini de iletiyoruz
        );
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204 No Content döndür
    }
}