// Yeni konum: src/main/java/com/fidanlik/fidanysserver/role/controller/RoleController.java
package com.fidanlik.fidanysserver.role.controller;

import com.fidanlik.fidanysserver.role.model.Role; // Yeni paket yolu
import com.fidanlik.fidanysserver.role.repository.RoleRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.model.User; // User modeli (yeni paket yolu)
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;
    // RoleService burada enjekte edilecek, ancak şimdilik repository'yi kullanıyoruz.

    @GetMapping
    public ResponseEntity<List<Role>> getAllRolesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Role> roles = roleRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(roles);
    }
}