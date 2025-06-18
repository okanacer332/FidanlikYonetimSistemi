// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/controller/LandController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Land;
import com.fidanlik.fidanysserver.fidan.service.LandService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lands")
@RequiredArgsConstructor
public class LandController {

    private final LandService landService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Land> createLand(@RequestBody Land land, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Land savedLand = landService.createLand(land, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLand);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<Land>> getAllLandsByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<Land> lands = landService.getAllLandsByTenant(tenantId);
        return ResponseEntity.ok(lands);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Land> updateLand(@PathVariable String id, @RequestBody Land land, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Land updatedLand = landService.updateLand(id, land, tenantId);
        return ResponseEntity.ok(updatedLand);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deleteLand(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        landService.deleteLand(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}