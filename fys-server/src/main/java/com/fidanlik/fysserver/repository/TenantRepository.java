package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional; // Optional importunu ekle

public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByName(String name); // Yeni eklendi
}