// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantAgeController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantAge; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.service.PlantAgeService; // Yeni service importu
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
@RequestMapping("/api/v1/plant-ages")
@RequiredArgsConstructor
public class PlantAgeController {

    private final PlantAgeService plantAgeService; // Repository yerine Service enjekte ettik

    // Fidan Yaşı Ekleme
    @PostMapping
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

    // Tüm Fidan Yaşlarını Listeleme (Tenant bazında)
    @GetMapping
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

    // Fidan Yaşı Güncelleme
    @PutMapping("/{id}")
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

    // Fidan Yaşı Silme
    @DeleteMapping("/{id}")
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