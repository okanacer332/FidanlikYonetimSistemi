package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Rootstock;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RootstockRepository extends MongoRepository<Rootstock, String> {
    List<Rootstock> findAllByTenantId(String tenantId);
    Optional<Rootstock> findByNameAndTenantId(String name, String tenantId);
}