// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/fidan/controller/PlantController.java
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
    // EKLENDİ: Yetkilendirme kuralı eklendi. Yönetici ve Satış Personeli oluşturabilir.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Plant> createPlant(@RequestBody Plant plant, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Plant savedPlant = plantService.createPlant(plant, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlant);
    }

    @GetMapping
    // EKLENDİ: Yetkilendirme kuralı eklendi. Tüm yetkili roller listeleyebilir.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<Plant>> getAllPlantsByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<Plant> plants = plantService.getAllPlantsByTenant(tenantId);
        return ResponseEntity.ok(plants);
    }

    @PutMapping("/{id}")
    // EKLENDİ: Yetkilendirme kuralı eklendi. Sadece yönetici güncelleyebilir.
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Plant> updatePlant(@PathVariable String id, @RequestBody Plant plant, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Plant updatedPlant = plantService.updatePlant(id, plant, tenantId);
        return ResponseEntity.ok(updatedPlant);
    }

    @DeleteMapping("/{id}")
    // EKLENDİ: Yetkilendirme kuralı eklendi. Sadece yönetici silebilir.
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deletePlant(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        plantService.deletePlant(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}