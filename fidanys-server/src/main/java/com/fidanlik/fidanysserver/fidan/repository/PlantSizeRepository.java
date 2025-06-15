// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantSizeRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.PlantSize; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantSizeRepository extends MongoRepository<PlantSize, String> {
    List<PlantSize> findAllByTenantId(String tenantId);
    Optional<PlantSize> findByNameAndTenantId(String name, String tenantId);
}