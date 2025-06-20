package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantSize;
import com.fidanlik.fidanysserver.fidan.service.PlantSizeService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-sizes")
@RequiredArgsConstructor
public class PlantSizeController {

    private final PlantSizeService plantSizeService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<PlantSize> createPlantSize(@RequestBody PlantSize plantSize, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantSize savedPlantSize = plantSizeService.createPlantSize(plantSize, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantSize);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<PlantSize>> getAllPlantSizesByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<PlantSize> plantSizes = plantSizeService.getAllPlantSizesByTenant(tenantId);
        return ResponseEntity.ok(plantSizes);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlantSize> updatePlantSize(@PathVariable String id, @RequestBody PlantSize plantSize, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantSize updatedPlantSize = plantSizeService.updatePlantSize(id, plantSize, tenantId);
        return ResponseEntity.ok(updatedPlantSize);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlantSize(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantSizeService.deletePlantSize(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}