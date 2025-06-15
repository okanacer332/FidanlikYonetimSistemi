// Yeni konum: src/main/java/com/fidanlik/fidanysserver/user/dto/UserCreateRequest.java
package com.fidanlik.fidanysserver.user.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserCreateRequest {
    private String username;
    private String email;
    private String password;
    private Set<String> roleIds;
}