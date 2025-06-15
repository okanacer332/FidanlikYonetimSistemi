package com.fidanlik.fysserver.auth.dto;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
    private String tenantName; // tenantId yerine tenantName
}