// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantAgeRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.PlantAge; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantAgeRepository extends MongoRepository<PlantAge, String> {
    List<PlantAge> findAllByTenantId(String tenantId);
    Optional<PlantAge> findByNameAndTenantId(String name, String tenantId);
}