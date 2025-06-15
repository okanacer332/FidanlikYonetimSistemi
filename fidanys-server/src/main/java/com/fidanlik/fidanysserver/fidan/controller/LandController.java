// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/controller/LandController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Land; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.service.LandService; // Yeni service importu
import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lands")
@RequiredArgsConstructor
public class LandController {

    private final LandService landService; // Repository yerine Service enjekte ettik

    // Arazi Ekleme
    @PostMapping
    public ResponseEntity<Land> createLand(@RequestBody Land land) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Land savedLand = landService.createLand(land, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLand);
    }

    // Tüm Arazileri Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<Land>> getAllLandsByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Land> lands = landService.getAllLandsByTenant(tenantId);
        return ResponseEntity.ok(lands);
    }

    // Arazi Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<Land> updateLand(@PathVariable String id, @RequestBody Land land) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Land updatedLand = landService.updateLand(id, land, tenantId);
        return ResponseEntity.ok(updatedLand);
    }

    // Arazi Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLand(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        landService.deleteLand(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}