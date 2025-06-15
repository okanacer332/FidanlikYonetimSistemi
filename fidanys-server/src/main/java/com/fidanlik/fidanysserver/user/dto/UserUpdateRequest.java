// Yeni konum: src/main/java/com/fidanlik/fidanysserver/user/dto/UserUpdateRequest.java
package com.fidanlik.fidanysserver.user.dto;

import lombok.Data;
import java.util.Set;
import java.util.Optional;

@Data
public class UserUpdateRequest {
    private String username;
    private String email;
    private Optional<String> password;
    private Set<String> roleIds;
}