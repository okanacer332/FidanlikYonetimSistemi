package com.fidanlik.fidanysserver.production.controller;

import com.fidanlik.fidanysserver.production.dto.ProductionBatchUpdateRequest;
import com.fidanlik.fidanysserver.production.dto.WastageRecordRequest;
import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.service.ProductionBatchService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production-batches")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
public class ProductionBatchController {

    private final ProductionBatchService productionBatchService;

    @GetMapping
    public ResponseEntity<List<ProductionBatch>> getAllBatches(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<ProductionBatch> batches = productionBatchService.getAllBatches(authenticatedUser.getTenantId());
        return ResponseEntity.ok(batches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionBatch> getBatchById(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        ProductionBatch batch = productionBatchService.getBatchById(id, authenticatedUser.getTenantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));
        return ResponseEntity.ok(batch);
    }

    // --- HATA VEREN ENDPOINT DÜZELTİLDİ ---
    @PostMapping("/{id}/wastage") // Path ve @PathVariable adı loglardaki hatayı çözecek şekilde düzeltildi.
    public ResponseEntity<ProductionBatch> recordWastage(
            @PathVariable String id,
            @RequestBody WastageRecordRequest request,
            Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        ProductionBatch updatedBatch = productionBatchService.recordWastage(id, request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedBatch);
    }

    // --- YENİ EKLENEN GÜNCELLEME (UPDATE) ENDPOINT'İ ---
    @PutMapping("/{id}")
    public ResponseEntity<ProductionBatch> updateBatch(
            @PathVariable String id,
            @RequestBody ProductionBatchUpdateRequest request,
            Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        ProductionBatch updatedBatch = productionBatchService.updateBatch(id, request, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedBatch);
    }

    // --- YENİ EKLENEN SİLME (DELETE) ENDPOINT'İ ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        productionBatchService.deleteBatch(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}