package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TenantRepository extends MongoRepository<Tenant, String> {
}