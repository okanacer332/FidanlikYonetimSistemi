package com.fidanlik.fysserver.repository;

import com.fidanlik.fysserver.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoleRepository extends MongoRepository<Role, String> {
}