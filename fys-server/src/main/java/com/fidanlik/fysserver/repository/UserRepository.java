package com.fidanlik.fysserver.repository;
import com.fidanlik.fysserver.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsernameAndTenantId(String username, String tenantId);
}