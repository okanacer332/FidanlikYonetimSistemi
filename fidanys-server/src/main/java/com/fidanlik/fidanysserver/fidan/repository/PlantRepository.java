// fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/repository/PlantRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.Plant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantRepository extends MongoRepository<Plant, String> {
    List<Plant> findAllByTenantId(String tenantId);

    // Yeni: landId'yi de benzersizlik kontrolüne dahil et
    Optional<Plant> findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndLandIdAndTenantId( // 'LandId' eklendi
                                                                                                                     String plantTypeId, String plantVarietyId, String rootstockId, String plantSizeId, String plantAgeId, String landId, String tenantId);
}