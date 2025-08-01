package com.fidanlik.fidanysserver.stock.controller;

import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
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
}