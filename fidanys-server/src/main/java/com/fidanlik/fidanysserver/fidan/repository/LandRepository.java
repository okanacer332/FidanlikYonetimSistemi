// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/LandRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.Land; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface LandRepository extends MongoRepository<Land, String> {
    List<Land> findAllByTenantId(String tenantId);
    Optional<Land> findByNameAndTenantId(String name, String tenantId);
}