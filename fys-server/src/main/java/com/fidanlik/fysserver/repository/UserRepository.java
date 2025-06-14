package com.fidanlik.fysserver.repository;
import com.fidanlik.fysserver.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List; // List importu
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsernameAndTenantId(String username, String tenantId);
    List<User> findAllByTenantId(String tenantId); // Yeni eklendi
    Optional<User> findByEmailAndTenantId(String email, String tenantId); // Email unique olduğu için ekleyelim
}