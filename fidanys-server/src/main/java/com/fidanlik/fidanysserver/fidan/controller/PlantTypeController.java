package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.PlantType;
import com.fidanlik.fidanysserver.fidan.service.PlantTypeService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plant-types")
@RequiredArgsConstructor
public class PlantTypeController {

    private final PlantTypeService plantTypeService;

    /**
     * Yeni bir fidan tipi oluşturur. Katalog verisi olduğu için sadece ADMIN tarafından yönetilir.
     * @param plantType Oluşturulacak fidan tipi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Oluşturulan fidan tipi nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlantType> createPlantType(@RequestBody PlantType plantType, @AuthenticationPrincipal User adminUser) {
        PlantType savedPlantType = plantTypeService.createPlantType(plantType, adminUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantType);
    }

    /**
     * Bir tenant'a ait tüm fidan tiplerini listeler.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Fidan tipleri listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<PlantType>> getAllPlantTypesByTenant(@AuthenticationPrincipal User authenticatedUser) {
        List<PlantType> plantTypes = plantTypeService.getAllPlantTypesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(plantTypes);
    }

    /**
     * Mevcut bir fidan tipini günceller.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Güncellenecek fidan tipinin ID'si.
     * @param plantType Yeni fidan tipi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Güncellenmiş fidan tipi nesnesi.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlantType> updatePlantType(@PathVariable String id, @RequestBody PlantType plantType, @AuthenticationPrincipal User adminUser) {
        PlantType updatedPlantType = plantTypeService.updatePlantType(id, plantType, adminUser.getTenantId());
        return ResponseEntity.ok(updatedPlantType);
    }

    /**
     * Bir fidan tipini siler.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Silinecek fidan tipinin ID'si.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlantType(@PathVariable String id, @AuthenticationPrincipal User adminUser) {
        plantTypeService.deletePlantType(id, adminUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}