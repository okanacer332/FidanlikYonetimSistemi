package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.service.ProductionBatchService;
import com.fidanlik.fidanysserver.user.model.User; // User modelini import edin
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Kullanıcı bilgisini almak için
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production-batches") // Endpoint yolu belirlendi
@RequiredArgsConstructor
public class ProductionBatchController {

    private final ProductionBatchService productionBatchService;

    // Yeni Üretim Partisi Oluşturma
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<ProductionBatch> createProductionBatch(
            @RequestBody ProductionBatch productionBatch,
            @AuthenticationPrincipal User currentUser) { // Current User'ı alıyoruz

        // Tenant ID'yi currentUser'dan alıp servise iletiyoruz
        ProductionBatch createdBatch = productionBatchService.createProductionBatch(productionBatch, currentUser.getTenantId());
        return new ResponseEntity<>(createdBatch, HttpStatus.CREATED);
    }

    // Tüm Üretim Partilerini Getirme
    @GetMapping
    public ResponseEntity<List<ProductionBatch>> getAllProductionBatches(
            @AuthenticationPrincipal User currentUser) {

        List<ProductionBatch> batches = productionBatchService.getAllProductionBatches(currentUser.getTenantId());
        return ResponseEntity.ok(batches);
    }

    // ID'ye göre Üretim Partisi Getirme
    @GetMapping("/{id}")
    public ResponseEntity<ProductionBatch> getProductionBatchById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {

        return productionBatchService.getProductionBatchById(id, currentUser.getTenantId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // YENİ EKLENEN: Partiyi tamamlama endpoint'i
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<ProductionBatch> completeProductionBatch(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        ProductionBatch completedBatch = productionBatchService.completeProductionBatch(id, currentUser.getTenantId());
        return ResponseEntity.ok(completedBatch);
    }

    // YENİ EKLENEN: Partiyi iptal etme endpoint'i
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<ProductionBatch> cancelProductionBatch(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        ProductionBatch canceledBatch = productionBatchService.cancelProductionBatch(id, currentUser.getTenantId());
        return ResponseEntity.ok(canceledBatch);
    }
}