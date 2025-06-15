package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Land;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface LandRepository extends MongoRepository<Land, String> {
    List<Land> findAllByTenantId(String tenantId);
    Optional<Land> findByNameAndTenantId(String name, String tenantId);
}