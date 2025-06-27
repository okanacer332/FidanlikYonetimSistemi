package com.fidanlik.fidanysserver.production.controller;

import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.service.ProductionBatchService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}