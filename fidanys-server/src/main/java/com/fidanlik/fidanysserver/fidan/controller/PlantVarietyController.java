package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantVariety;
import com.fidanlik.fidanysserver.fidan.service.PlantVarietyService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-varieties")
@RequiredArgsConstructor
public class PlantVarietyController {

    private final PlantVarietyService plantVarietyService;

    /**
     * Yeni bir fidan çeşidi oluşturur. Katalog verisi olduğu için sadece ADMIN tarafından yönetilir.
     * @param plantVariety Oluşturulacak fidan çeşidi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Oluşturulan fidan çeşidi nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlantVariety> createPlantVariety(@RequestBody PlantVariety plantVariety, @AuthenticationPrincipal User adminUser) {
        PlantVariety savedPlantVariety = plantVarietyService.createPlantVariety(plantVariety, adminUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantVariety);
    }

    /**
     * Bir tenant'a ait tüm fidan çeşitlerini listeler.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Fidan çeşitleri listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<PlantVariety>> getAllPlantVarietiesByTenant(@AuthenticationPrincipal User authenticatedUser) {
        List<PlantVariety> plantVarieties = plantVarietyService.getAllPlantVarietiesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(plantVarieties);
    }

    /**
     * Belirli bir fidan tipine ait olan fidan çeşitlerini listeler.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param plantTypeId Fidan tipi ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Fidan çeşitleri listesi.
     */
    @GetMapping("/by-plant-type/{plantTypeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<PlantVariety>> getPlantVarietiesByPlantTypeAndTenant(@PathVariable String plantTypeId, @AuthenticationPrincipal User authenticatedUser) {
        List<PlantVariety> plantVarieties = plantVarietyService.getPlantVarietiesByPlantTypeAndTenant(plantTypeId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(plantVarieties);
    }

    /**
     * Mevcut bir fidan çeşidini günceller.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Güncellenecek fidan çeşidinin ID'si.
     * @param plantVariety Yeni fidan çeşidi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Güncellenmiş fidan çeşidi nesnesi.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlantVariety> updatePlantVariety(@PathVariable String id, @RequestBody PlantVariety plantVariety, @AuthenticationPrincipal User adminUser) {
        PlantVariety updatedPlantVariety = plantVarietyService.updatePlantVariety(id, plantVariety, adminUser.getTenantId());
        return ResponseEntity.ok(updatedPlantVariety);
    }

    /**
     * Bir fidan çeşidini siler.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Silinecek fidan çeşidinin ID'si.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 24 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlantVariety(@PathVariable String id, @AuthenticationPrincipal User adminUser) {
        plantVarietyService.deletePlantVariety(id, adminUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}