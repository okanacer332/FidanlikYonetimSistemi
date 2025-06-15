// Yeni konum: src/main/java/com/fidanlik/fidanysserver/role/repository/RoleRepository.java
package com.fidanlik.fidanysserver.role.repository;

import com.fidanlik.fidanysserver.role.model.Role; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RoleRepository extends MongoRepository<Role, String> {
    List<Role> findAllByTenantId(String tenantId);
}