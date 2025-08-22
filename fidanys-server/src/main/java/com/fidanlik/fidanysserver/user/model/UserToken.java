package com.fidanlik.fidanysserver.user.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "user_tokens")
public class UserToken {
    @Id
    private String id;
    private String userId;
    private String token;
    private String tenantId;
}