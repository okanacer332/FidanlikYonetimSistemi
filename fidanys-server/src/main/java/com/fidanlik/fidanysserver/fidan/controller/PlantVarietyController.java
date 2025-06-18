// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantVarietyController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantVariety;
import com.fidanlik.fidanysserver.fidan.service.PlantVarietyService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-varieties")
@RequiredArgsConstructor
public class PlantVarietyController {

    private final PlantVarietyService plantVarietyService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<PlantVariety> createPlantVariety(@RequestBody PlantVariety plantVariety, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantVariety savedPlantVariety = plantVarietyService.createPlantVariety(plantVariety, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantVariety);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<PlantVariety>> getAllPlantVarietiesByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<PlantVariety> plantVarieties = plantVarietyService.getAllPlantVarietiesByTenant(tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    @GetMapping("/by-plant-type/{plantTypeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<PlantVariety>> getPlantVarietiesByPlantTypeAndTenant(@PathVariable String plantTypeId, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<PlantVariety> plantVarieties = plantVarietyService.getPlantVarietiesByPlantTypeAndTenant(plantTypeId, tenantId);
        return ResponseEntity.ok(plantVarieties);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<PlantVariety> updatePlantVariety(@PathVariable String id, @RequestBody PlantVariety plantVariety, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantVariety updatedPlantVariety = plantVarietyService.updatePlantVariety(id, plantVariety, tenantId);
        return ResponseEntity.ok(updatedPlantVariety);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deletePlantVariety(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantVarietyService.deletePlantVariety(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}