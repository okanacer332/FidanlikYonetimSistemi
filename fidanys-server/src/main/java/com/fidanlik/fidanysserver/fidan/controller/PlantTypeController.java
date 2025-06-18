package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantType;
import com.fidanlik.fidanysserver.fidan.service.PlantTypeService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Ekledik
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-types")
@RequiredArgsConstructor
public class PlantTypeController {

    private final PlantTypeService plantTypeService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici oluşturabilir
    public ResponseEntity<PlantType> createPlantType(@RequestBody PlantType plantType, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantType savedPlantType = plantTypeService.createPlantType(plantType, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantType);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
    public ResponseEntity<List<PlantType>> getAllPlantTypesByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<PlantType> plantTypes = plantTypeService.getAllPlantTypesByTenant(tenantId);
        return ResponseEntity.ok(plantTypes);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici güncelleyebilir
    public ResponseEntity<PlantType> updatePlantType(@PathVariable String id, @RequestBody PlantType plantType, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantType updatedPlantType = plantTypeService.updatePlantType(id, plantType, tenantId);
        return ResponseEntity.ok(updatedPlantType);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici silebilir
    public ResponseEntity<Void> deletePlantType(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantTypeService.deletePlantType(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}