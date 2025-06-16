// fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Plant; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.service.PlantService; // Yeni service importu
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
@RequestMapping("/api/v1/plants")
@RequiredArgsConstructor
public class PlantController {

    private final PlantService plantService; // Repository yerine Service enjekte ettik

    // Yeni Fidan Kimliği Ekleme
    @PostMapping
    public ResponseEntity<Plant> createPlant(@RequestBody Plant plant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İş mantığını Service'e devrediyoruz
        Plant savedPlant = plantService.createPlant(plant, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlant);
    }

    // Tüm Fidan Kimliklerini Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<Plant>> getAllPlantsByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İş mantığını Service'e devrediyoruz
        List<Plant> plants = plantService.getAllPlantsByTenant(tenantId);
        return ResponseEntity.ok(plants);
    }

    // Fidan Kimliği Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<Plant> updatePlant(@PathVariable String id, @RequestBody Plant plant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İş mantığını Service'e devrediyoruz
        Plant updatedPlant = plantService.updatePlant(id, plant, tenantId);
        return ResponseEntity.ok(updatedPlant);
    }

    // Fidan Kimliği Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlant(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İş mantığını Service'e devrediyoruz
        plantService.deletePlant(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}