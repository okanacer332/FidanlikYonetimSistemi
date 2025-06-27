package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionBatchRepository extends MongoRepository<ProductionBatch, String> {
    List<ProductionBatch> findAllByTenantId(String tenantId);
    Optional<ProductionBatch> findByBatchNameAndTenantId(String batchName, String tenantId);
    // İleride partiye fidan türü/çeşidi ile de erişim gerekirse eklenebilir:
    // List<ProductionBatch> findByPlantTypeIdAndPlantVarietyIdAndTenantId(String plantTypeId, String plantVarietyId, String tenantId);
}