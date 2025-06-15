package com.fidanlik.fysserver.controller.dto;

import lombok.Data;
import java.util.Set;
import java.util.Optional; // Optional importu

@Data
public class UserUpdateRequest {
    private String username;
    private String email;
    private Optional<String> password; // Parola opsiyonel olduğu için Optional kullandık
    private Set<String> roleIds; // Atanacak rol ID'leri
}