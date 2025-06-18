// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantAgeController.java
package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantAge;
import com.fidanlik.fidanysserver.fidan.service.PlantAgeService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-ages")
@RequiredArgsConstructor
public class PlantAgeController {

    private final PlantAgeService plantAgeService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<PlantAge> createPlantAge(@RequestBody PlantAge plantAge, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantAge savedPlantAge = plantAgeService.createPlantAge(plantAge, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantAge);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<PlantAge>> getAllPlantAgesByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<PlantAge> plantAges = plantAgeService.getAllPlantAgesByTenant(tenantId);
        return ResponseEntity.ok(plantAges);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<PlantAge> updatePlantAge(@PathVariable String id, @RequestBody PlantAge plantAge, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        PlantAge updatedPlantAge = plantAgeService.updatePlantAge(id, plantAge, tenantId);
        return ResponseEntity.ok(updatedPlantAge);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deletePlantAge(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantAgeService.deletePlantAge(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}