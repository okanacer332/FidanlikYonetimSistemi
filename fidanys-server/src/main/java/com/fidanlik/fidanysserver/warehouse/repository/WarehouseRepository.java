// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/warehouse/repository/WarehouseRepository.java
package com.fidanlik.fidanysserver.warehouse.repository;

import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends MongoRepository<Warehouse, String> {
    List<Warehouse> findAllByTenantId(String tenantId);
    Optional<Warehouse> findByNameAndTenantId(String name, String tenantId);
}