package com.fidanlik.fidanysserver.role.repository;

import com.fidanlik.fidanysserver.role.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional; // Optional import'unu ekleyin

public interface RoleRepository extends MongoRepository<Role, String> {
    List<Role> findAllByTenantId(String tenantId);

    // YENİ EKLENEN METOT: İsim ve Tenant ID'ye göre bir rol bulur.
    Optional<Role> findByNameAndTenantId(String name, String tenantId);
}
