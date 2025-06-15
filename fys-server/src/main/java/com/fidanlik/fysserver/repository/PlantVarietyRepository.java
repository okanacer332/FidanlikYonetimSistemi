package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.PlantVariety;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PlantVarietyRepository extends MongoRepository<PlantVariety, String> {
    List<PlantVariety> findAllByTenantId(String tenantId); // Tenant bazında tüm çeşitleri getir
    List<PlantVariety> findAllByPlantTypeIdAndTenantId(String plantTypeId, String tenantId); // Belirli bir türe ait çeşitleri getir
    Optional<PlantVariety> findByNameAndPlantTypeIdAndTenantId(String name, String plantTypeId, String tenantId); // Benzersizlik kontrolü
}