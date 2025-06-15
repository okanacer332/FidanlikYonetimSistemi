package com.fidanlik.fysserver.controller.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserUpdateRequest {
    private String id; // Güncellenecek kullanıcının ID'si
    private String username;
    private String email;
    private Set<String> roleIds; // Atanacak rol ID'leri
}