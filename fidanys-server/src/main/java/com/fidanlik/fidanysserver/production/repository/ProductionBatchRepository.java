package com.fidanlik.fidanysserver.production.repository;

import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProductionBatchRepository extends MongoRepository<ProductionBatch, String> {
    List<ProductionBatch> findAllByTenantId(String tenantId);
    Optional<ProductionBatch> findByNameAndTenantId(String name, String tenantId);
}