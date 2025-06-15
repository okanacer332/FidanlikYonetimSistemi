package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.PlantType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List; // List importu
import java.util.Optional; // Optional importu

public interface PlantTypeRepository extends MongoRepository<PlantType, String> {
    // Tenant bazında türleri getirmek için yeni metot
    List<PlantType> findAllByTenantId(String tenantId);

    // Tenant bazında belirli bir türü adına göre bulmak için yeni metot (benzersizlik için)
    Optional<PlantType> findByNameAndTenantId(String name, String tenantId);
}