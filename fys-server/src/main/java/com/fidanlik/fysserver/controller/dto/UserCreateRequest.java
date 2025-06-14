package com.fidanlik.fysserver.controller.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserCreateRequest {
    private String username;
    private String email;
    private String password;
    private Set<String> roleIds; // Atanacak rol ID'leri
}