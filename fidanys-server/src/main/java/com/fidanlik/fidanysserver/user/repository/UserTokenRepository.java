package com.fidanlik.fidanysserver.user.repository;

import com.fidanlik.fidanysserver.user.model.UserToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserTokenRepository extends MongoRepository<UserToken, String> {
    Optional<UserToken> findByUserIdAndTenantId(String userId, String tenantId);
}