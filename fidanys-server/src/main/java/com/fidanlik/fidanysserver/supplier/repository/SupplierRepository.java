// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/supplier/repository/SupplierRepository.java
package com.fidanlik.fidanysserver.supplier.repository;

import com.fidanlik.fidanysserver.supplier.model.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends MongoRepository<Supplier, String> {
    List<Supplier> findAllByTenantId(String tenantId);
    Optional<Supplier> findByNameAndTenantId(String name, String tenantId);
}