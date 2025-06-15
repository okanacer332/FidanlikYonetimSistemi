// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/repository/RootstockRepository.java
package com.fidanlik.fidanysserver.fidan.repository;

import com.fidanlik.fidanysserver.fidan.model.Rootstock; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RootstockRepository extends MongoRepository<Rootstock, String> {
    List<Rootstock> findAllByTenantId(String tenantId);
    Optional<Rootstock> findByNameAndTenantId(String name, String tenantId);
}