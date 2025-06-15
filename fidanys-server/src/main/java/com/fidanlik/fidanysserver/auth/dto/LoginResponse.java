// Yeni konum: src/main/java/com/fidanlik/fidanysserver/auth/dto/LoginResponse.java
package com.fidanlik.fidanysserver.auth.dto;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginResponse {
    private String token;
}