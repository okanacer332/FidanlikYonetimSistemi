package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.Role;
import com.fidanlik.fysserver.model.User; // Principal'dan tenantId almak için User modelini kullanacağız
import com.fidanlik.fysserver.repository.RoleRepository;
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

    @GetMapping
    public ResponseEntity<List<Role>> getAllRolesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build(); // Yetkilendirme yok
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId(); // JWT'den alınan tenantId

        if (tenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        List<Role> roles = roleRepository.findAllByTenantId(tenantId); // findAllByTenantId metodunu ekleyeceğiz
        return ResponseEntity.ok(roles);
    }
}