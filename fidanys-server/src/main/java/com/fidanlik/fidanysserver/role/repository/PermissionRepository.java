// Yeni konum: src/main/java/com/fidanlik/fidanysserver/role/repository/PermissionRepository.java
package com.fidanlik.fidanysserver.role.repository;

import com.fidanlik.fidanysserver.role.model.Permission; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PermissionRepository extends MongoRepository<Permission, String> {
}