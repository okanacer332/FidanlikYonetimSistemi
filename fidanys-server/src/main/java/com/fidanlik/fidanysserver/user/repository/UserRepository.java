// Yeni konum: src/main/java/com/fidanlik/fidanysserver/user/repository/UserRepository.java
package com.fidanlik.fidanysserver.user.repository;
import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsernameAndTenantId(String username, String tenantId);
    List<User> findAllByTenantId(String tenantId);
    Optional<User> findByEmailAndTenantId(String email, String tenantId);
}