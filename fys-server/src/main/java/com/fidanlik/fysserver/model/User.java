package com.fidanlik.fysserver.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Set;

@Data @Document(collection = "users")
public class User {
    @Id private String id;
    @Indexed(unique = true) private String username;
    @Indexed(unique = true) private String email;
    private String password;
    @DBRef private Set<Role> roles;
    private String tenantId;
}