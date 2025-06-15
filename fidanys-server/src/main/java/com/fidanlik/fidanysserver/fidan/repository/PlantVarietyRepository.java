// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantVarietyRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.PlantVariety; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantVarietyRepository extends MongoRepository<PlantVariety, String> {
    List<PlantVariety> findAllByTenantId(String tenantId);
    List<PlantVariety> findAllByPlantTypeIdAndTenantId(String plantTypeId, String tenantId);
    Optional<PlantVariety> findByNameAndPlantTypeIdAndTenantId(String name, String plantTypeId, String tenantId);
}