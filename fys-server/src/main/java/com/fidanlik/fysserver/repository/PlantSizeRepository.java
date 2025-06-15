package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.PlantSize;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantSizeRepository extends MongoRepository<PlantSize, String> {
    List<PlantSize> findAllByTenantId(String tenantId);
    Optional<PlantSize> findByNameAndTenantId(String name, String tenantId);
}