package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List; // List importu

public interface RoleRepository extends MongoRepository<Role, String> {
    List<Role> findAllByTenantId(String tenantId); // Yeni eklendi
}