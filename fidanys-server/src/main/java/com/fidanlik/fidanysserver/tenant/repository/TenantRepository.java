// Yeni konum: src/main/java/com/fidanlik/fidanysserver/tenant/repository/TenantRepository.java
package com.fidanlik.fidanysserver.tenant.repository;

import com.fidanlik.fidanysserver.tenant.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByName(String name);
}