package com.fidanlik.fysserver.model;
import lombok.Data;
import org.springframework.data.annotation.Transient; // Add this import
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data @Document(collection = "users")
public class User {
    @Id private String id;
    @Indexed(unique = true) private String username;
    @Indexed(unique = true) private String email;
    private String password;

    private Set<String> roleIds; // Sadece rol ID'lerini tut

    private String tenantId;

    @Transient // Bu alanın MongoDB'ye kaydedilmemesini sağlar
    private Set<Role> roles; // Frontend'e gönderilecek gerçek Role nesneleri için
}