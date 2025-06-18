package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantAge;
import com.fidanlik.fidanysserver.fidan.service.PlantAgeService;
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
@RequestMapping("/api/v1/plant-ages")
@RequiredArgsConstructor
public class PlantAgeController {

    private final PlantAgeService plantAgeService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici oluşturabilir
    public ResponseEntity<PlantAge> createPlantAge(@RequestBody PlantAge plantAge) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        PlantAge savedPlantAge = plantAgeService.createPlantAge(plantAge, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantAge);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
    public ResponseEntity<List<PlantAge>> getAllPlantAgesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantAge> plantAges = plantAgeService.getAllPlantAgesByTenant(tenantId);
        return ResponseEntity.ok(plantAges);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici güncelleyebilir
    public ResponseEntity<PlantAge> updatePlantAge(@PathVariable String id, @RequestBody PlantAge plantAge) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        PlantAge updatedPlantAge = plantAgeService.updatePlantAge(id, plantAge, tenantId);
        return ResponseEntity.ok(updatedPlantAge);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici silebilir
    public ResponseEntity<Void> deletePlantAge(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        plantAgeService.deletePlantAge(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}