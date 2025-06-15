// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantTypeRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.PlantType; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantTypeRepository extends MongoRepository<PlantType, String> {
    List<PlantType> findAllByTenantId(String tenantId);
    Optional<PlantType> findByNameAndTenantId(String name, String tenantId);
}