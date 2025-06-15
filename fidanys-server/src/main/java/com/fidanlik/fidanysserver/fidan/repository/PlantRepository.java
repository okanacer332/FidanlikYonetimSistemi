// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.Plant; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantRepository extends MongoRepository<Plant, String> {
    List<Plant> findAllByTenantId(String tenantId);

    Optional<Plant> findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndTenantId(
            String plantTypeId, String plantVarietyId, String rootstockId, String plantSizeId, String plantAgeId, String tenantId);
}