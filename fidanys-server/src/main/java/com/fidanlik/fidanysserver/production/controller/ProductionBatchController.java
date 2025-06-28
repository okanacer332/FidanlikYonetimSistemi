package com.fidanlik.fidanysserver.production.controller;

import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.service.ProductionBatchService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production-batches")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')") // Sadece ADMIN ve DEPO rolleri erişebilir
public class ProductionBatchController {

    private final ProductionBatchService productionBatchService;

    @PostMapping
    public ResponseEntity<ProductionBatch> createProductionBatch(@RequestBody ProductionBatch productionBatch, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        ProductionBatch savedBatch = productionBatchService.createProductionBatch(productionBatch, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBatch);
    }

    @GetMapping
    public ResponseEntity<List<ProductionBatch>> getAllProductionBatches(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<ProductionBatch> batches = productionBatchService.getAllProductionBatchesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(batches);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductionBatch> updateProductionBatch(@PathVariable String id, @RequestBody ProductionBatch productionBatch, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        ProductionBatch updatedBatch = productionBatchService.updateProductionBatch(id, productionBatch, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedBatch);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductionBatch(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        productionBatchService.deleteProductionBatch(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}