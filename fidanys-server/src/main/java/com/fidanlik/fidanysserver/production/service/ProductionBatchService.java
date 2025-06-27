package com.fidanlik.fidanysserver.production.service;

import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository productionBatchRepository;

    public List<ProductionBatch> getAllBatches(String tenantId) {
        return productionBatchRepository.findAllByTenantId(tenantId);
    }

    public Optional<ProductionBatch> getBatchById(String id, String tenantId) {
        Optional<ProductionBatch> batch = productionBatchRepository.findById(id);
        if (batch.isPresent() && !batch.get().getTenantId().equals(tenantId)) {
            // Güvenlik için, başka bir tenanta ait veriye erişimi engelle
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu partiye erişim yetkiniz yok.");
        }
        return batch;
    }
}