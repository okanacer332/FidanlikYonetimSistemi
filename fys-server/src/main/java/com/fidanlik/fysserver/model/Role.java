package com.fidanlik.fysserver.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Set;

@Data @Document(collection = "roles")
public class Role {
    @Id private String id;
    private String name;
    @DBRef private Set<Permission> permissions;
    private String tenantId; // Yeni eklendi
}