// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantVarietyController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantVariety; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.service.PlantVarietyService; // Yeni service importu
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
@RequestMapping("/api/v1/plant-varieties")
@RequiredArgsConstructor
public class PlantVarietyController {

    private final PlantVarietyService plantVarietyService; // Repository yerine Service enjekte ettik

    // Fidan Çeşidi Ekleme
    @PostMapping
    public ResponseEntity<PlantVariety> createPlantVariety(@RequestBody PlantVariety plantVariety) {
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
        PlantVariety savedPlantVariety = plantVarietyService.createPlantVariety(plantVariety, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantVariety);
    }

    // Tüm Fidan Çeşitlerini Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<PlantVariety>> getAllPlantVarietiesByTenant() {
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
        List<PlantVariety> plantVarieties = plantVarietyService.getAllPlantVarietiesByTenant(tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    // Belirli bir Fidan Türüne ait Çeşitleri Listeleme (Tenant bazında)
    @GetMapping("/by-plant-type/{plantTypeId}")
    public ResponseEntity<List<PlantVariety>> getPlantVarietiesByPlantTypeAndTenant(@PathVariable String plantTypeId) {
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
        List<PlantVariety> plantVarieties = plantVarietyService.getPlantVarietiesByPlantTypeAndTenant(plantTypeId, tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    // Fidan Çeşidi Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<PlantVariety> updatePlantVariety(@PathVariable String id, @RequestBody PlantVariety plantVariety) {
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
        PlantVariety updatedPlantVariety = plantVarietyService.updatePlantVariety(id, plantVariety, tenantId);
        return ResponseEntity.ok(updatedPlantVariety);
    }

    // Fidan Çeşidi Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantVariety(@PathVariable String id) {
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
        plantVarietyService.deletePlantVariety(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}