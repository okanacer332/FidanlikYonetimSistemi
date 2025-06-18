package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantSize;
import com.fidanlik.fidanysserver.fidan.service.PlantSizeService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Ekledik
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-sizes")
@RequiredArgsConstructor
public class PlantSizeController {

    private final PlantSizeService plantSizeService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici oluşturabilir
    public ResponseEntity<PlantSize> createPlantSize(@RequestBody PlantSize plantSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        PlantSize savedPlantSize = plantSizeService.createPlantSize(plantSize, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantSize);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
    public ResponseEntity<List<PlantSize>> getAllPlantSizesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantSize> plantSizes = plantSizeService.getAllPlantSizesByTenant(tenantId);
        return ResponseEntity.ok(plantSizes);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici güncelleyebilir
    public ResponseEntity<PlantSize> updatePlantSize(@PathVariable String id, @RequestBody PlantSize plantSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        PlantSize updatedPlantSize = plantSizeService.updatePlantSize(id, plantSize, tenantId);
        return ResponseEntity.ok(updatedPlantSize);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici silebilir
    public ResponseEntity<Void> deletePlantSize(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        plantSizeService.deletePlantSize(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}