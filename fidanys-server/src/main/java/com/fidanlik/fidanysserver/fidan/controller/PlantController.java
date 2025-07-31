package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plants")
@RequiredArgsConstructor
public class PlantController {

    private final PlantService plantService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Plant> createPlant(@RequestBody Plant plant, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Plant savedPlant = plantService.createPlant(plant, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlant);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Plant>> getAllPlantsByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<Plant> plants = plantService.getAllPlantsByTenant(tenantId);
        return ResponseEntity.ok(plants);
    }

    // YENİ EKLENEN ENDPOINT: Fidan türü ve çeşidine göre tek bir fidan bulma
    @GetMapping("/by-type-and-variety")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Plant> getPlantByTypeIdAndVarietyId(
            @RequestParam String plantTypeId,
            @RequestParam String plantVarietyId,
            Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        return plantService.getPlantByTypeIdAndVarietyId(plantTypeId, plantVarietyId, tenantId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Plant> updatePlant(@PathVariable String id, @RequestBody Plant plant, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Plant updatedPlant = plantService.updatePlant(id, plant, tenantId);
        return ResponseEntity.ok(updatedPlant);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlant(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantService.deletePlant(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}