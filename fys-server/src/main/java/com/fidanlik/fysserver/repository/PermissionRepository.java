package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PermissionRepository extends MongoRepository<Permission, String> {
}