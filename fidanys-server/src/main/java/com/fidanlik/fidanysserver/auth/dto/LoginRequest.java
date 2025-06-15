// Yeni konum: src/main/java/com/fidanlik/fidanysserver/auth/dto/LoginRequest.java
package com.fidanlik.fidanysserver.auth.dto;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
    private String tenantName;
}