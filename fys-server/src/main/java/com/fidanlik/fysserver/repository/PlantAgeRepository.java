package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.PlantAge;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantAgeRepository extends MongoRepository<PlantAge, String> {
    List<PlantAge> findAllByTenantId(String tenantId);
    Optional<PlantAge> findByNameAndTenantId(String name, String tenantId);
}