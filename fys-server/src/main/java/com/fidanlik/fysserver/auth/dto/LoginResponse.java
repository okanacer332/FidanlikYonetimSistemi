package com.fidanlik.fysserver.auth.dto;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginResponse {
    private String token;
}