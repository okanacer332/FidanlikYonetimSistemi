package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantVariety;
import com.fidanlik.fidanysserver.fidan.service.PlantVarietyService;
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
@RequestMapping("/api/v1/plant-varieties")
@RequiredArgsConstructor
public class PlantVarietyController {

    private final PlantVarietyService plantVarietyService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici oluşturabilir
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

        PlantVariety savedPlantVariety = plantVarietyService.createPlantVariety(plantVariety, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantVariety);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
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

        List<PlantVariety> plantVarieties = plantVarietyService.getAllPlantVarietiesByTenant(tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    @GetMapping("/by-plant-type/{plantTypeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
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

        List<PlantVariety> plantVarieties = plantVarietyService.getPlantVarietiesByPlantTypeAndTenant(plantTypeId, tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici güncelleyebilir
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

        PlantVariety updatedPlantVariety = plantVarietyService.updatePlantVariety(id, plantVariety, tenantId);
        return ResponseEntity.ok(updatedPlantVariety);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici silebilir
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

        plantVarietyService.deletePlantVariety(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}