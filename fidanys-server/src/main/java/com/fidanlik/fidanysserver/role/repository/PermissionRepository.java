package com.fidanlik.fidanysserver.role.repository;

import com.fidanlik.fidanysserver.role.model.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List; // List import'unu ekleyin

public interface PermissionRepository extends MongoRepository<Permission, String> {
    // YENİ EKLENEN METOT: Tenant ID'ye göre tüm izinleri bulur.
    List<Permission> findAllByTenantId(String tenantId);
}
