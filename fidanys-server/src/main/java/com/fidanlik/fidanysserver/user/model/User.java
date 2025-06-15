// Yeni konum: src/main/java/com/fidanlik/fidanysserver/user/model/User.java
package com.fidanlik.fidanysserver.user.model;
import lombok.Data;
import org.springframework.data.annotation.Transient;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fidanlik.fidanysserver.role.model.Role; // Yeni paket yolu (Role modeline referans için)
import java.util.Set;

@Data @Document(collection = "users")
public class User {
    @Id private String id;
    @Indexed(unique = true) private String username;
    @Indexed(unique = true) private String email;
    private String password;

    private Set<String> roleIds;

    private String tenantId;

    @Transient private Set<Role> roles;
}