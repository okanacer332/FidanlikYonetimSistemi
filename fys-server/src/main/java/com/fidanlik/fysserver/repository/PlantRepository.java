package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Plant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantRepository extends MongoRepository<Plant, String> {
    // Tenant bazında tüm fidan kimliklerini getir
    List<Plant> findAllByTenantId(String tenantId);

    // Belirli bir fidan kimliği kombinasyonunu tenant bazında bulmak için (benzersizlik)
    Optional<Plant> findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndTenantId(
            String plantTypeId, String plantVarietyId, String rootstockId, String plantSizeId, String plantAgeId, String tenantId);

    // Daha sonra ihtiyacımız olursa belirli bir türe ait tüm fidan kimliklerini getirme gibi metotlar da eklenebilir.
    // List<Plant> findAllByPlantTypeIdAndTenantId(String plantTypeId, String tenantId);
}