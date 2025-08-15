package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plants")
@RequiredArgsConstructor
public class PlantController {

    private final PlantService plantService;

    /**
     * Yeni bir fidan/ürün oluşturur.
     * Katalog tutarlılığı için bu işlem sadece ADMIN rolü tarafından yapılabilir.
     * @param plant Oluşturulacak fidan bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Oluşturulan fidan nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Plant> createPlant(@RequestBody Plant plant, @AuthenticationPrincipal User adminUser) {
        Plant savedPlant = plantService.createPlant(plant, adminUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlant);
    }

    /**
     * Bir tenant'a ait tüm fidanları/ürünleri listeler.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Fidan listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Plant>> getAllPlantsByTenant(@AuthenticationPrincipal User authenticatedUser) {
        List<Plant> plants = plantService.getAllPlantsByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(plants);
    }

    /**
     * Fidan türü ve çeşidine göre tek bir fidan bulur.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param plantTypeId Fidan türü ID'si.
     * @param plantVarietyId Fidan çeşidi ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Bulunan fidan veya 404 Not Found.
     */
    @GetMapping("/by-type-and-variety")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Plant> getPlantByTypeIdAndVarietyId(
            @RequestParam String plantTypeId,
            @RequestParam String plantVarietyId,
            @AuthenticationPrincipal User authenticatedUser) {

        return plantService.getPlantByTypeIdAndVarietyId(plantTypeId, plantVarietyId, authenticatedUser.getTenantId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Mevcut bir fidanı günceller.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Güncellenecek fidanın ID'si.
     * @param plant Yeni fidan bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Güncellenmiş fidan nesnesi.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Plant> updatePlant(@PathVariable String id, @RequestBody Plant plant, @AuthenticationPrincipal User adminUser) {
        Plant updatedPlant = plantService.updatePlant(id, plant, adminUser.getTenantId());
        return ResponseEntity.ok(updatedPlant);
    }

    /**
     * Bir fidanı siler.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Silinecek fidanın ID'si.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePlant(@PathVariable String id, @AuthenticationPrincipal User adminUser) {
        plantService.deletePlant(id, adminUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}