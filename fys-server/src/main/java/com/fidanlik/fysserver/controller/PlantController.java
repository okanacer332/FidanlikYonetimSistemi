package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.*; // Tüm modelleri import et (PlantType, PlantVariety vb.)
import com.fidanlik.fysserver.repository.*; // Tüm repository'leri import et
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.fidanlik.fysserver.model.Plant; // Bu satırı ekle
import com.fidanlik.fysserver.repository.PlantRepository; // Bu satırı ekle

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/plants")
@RequiredArgsConstructor
public class PlantController {

    private final PlantRepository plantRepository;
    private final PlantTypeRepository plantTypeRepository;
    private final PlantVarietyRepository plantVarietyRepository;
    private final RootstockRepository rootstockRepository;
    private final PlantSizeRepository plantSizeRepository;
    private final PlantAgeRepository plantAgeRepository;
    private final LandRepository landRepository; // İleride stok takibi için Land repository'si de eklendi

    // Yeni Fidan Kimliği Ekleme
    @PostMapping
    public ResponseEntity<Plant> createPlant(@RequestBody Plant plant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        // 1. Tüm referans ID'lerinin geçerliliğini ve tenant'a ait olup olmadığını kontrol et
        // PlantType
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plant.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait PlantType
        }
        plant.setPlantType(plantTypeOptional.get());

        // PlantVariety
        Optional<PlantVariety> plantVarietyOptional = plantVarietyRepository.findById(plant.getPlantVarietyId());
        if (plantVarietyOptional.isEmpty() || !plantVarietyOptional.get().getTenantId().equals(tenantId) || !plantVarietyOptional.get().getPlantTypeId().equals(plant.getPlantTypeId())) {
            return ResponseEntity.badRequest().body(null); // Geçersiz/başka tenant'a ait PlantVariety veya PlantType ile uyuşmuyor
        }
        plant.setPlantVariety(plantVarietyOptional.get());

        // Rootstock
        Optional<Rootstock> rootstockOptional = rootstockRepository.findById(plant.getRootstockId());
        if (rootstockOptional.isEmpty() || !rootstockOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait Rootstock
        }
        plant.setRootstock(rootstockOptional.get());

        // PlantSize
        Optional<PlantSize> plantSizeOptional = plantSizeRepository.findById(plant.getPlantSizeId());
        if (plantSizeOptional.isEmpty() || !plantSizeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait PlantSize
        }
        plant.setPlantSize(plantSizeOptional.get());

        // PlantAge
        Optional<PlantAge> plantAgeOptional = plantAgeRepository.findById(plant.getPlantAgeId());
        if (plantAgeOptional.isEmpty() || !plantAgeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait PlantAge
        }
        plant.setPlantAge(plantAgeOptional.get());


        // 2. Aynı tenant içinde aynı kombinasyonda (Fidan Kimliği) var mı kontrol et
        if (plantRepository.findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndTenantId(
                plant.getPlantTypeId(), plant.getPlantVarietyId(), plant.getRootstockId(),
                plant.getPlantSizeId(), plant.getPlantAgeId(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict - Bu fidan kimliği zaten mevcut
        }

        plant.setTenantId(tenantId); // Fidan kimliğinin tenantId'sini set et
        Plant savedPlant = plantRepository.save(plant);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlant); // 201 Created
    }

    // Tüm Fidan Kimliklerini Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<Plant>> getAllPlantsByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Plant> plants = plantRepository.findAllByTenantId(tenantId);
        // DBRef ile otomatik doldurulan alanlar için ek kontrol veya manuel doldurma
        // Spring Data MongoDB @DBRef ile çoğu zaman otomatik doldurur, ancak emin olmak için:
        plants.forEach(plant -> {
            plantTypeRepository.findById(plant.getPlantTypeId()).ifPresent(plant::setPlantType);
            plantVarietyRepository.findById(plant.getPlantVarietyId()).ifPresent(plant::setPlantVariety);
            rootstockRepository.findById(plant.getRootstockId()).ifPresent(plant::setRootstock);
            plantSizeRepository.findById(plant.getPlantSizeId()).ifPresent(plant::setPlantSize);
            plantAgeRepository.findById(plant.getPlantAgeId()).ifPresent(plant::setPlantAge);
        });

        return ResponseEntity.ok(plants); // 200 OK
    }

    // Fidan Kimliği Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<Plant> updatePlant(@PathVariable String id, @RequestBody Plant plant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Plant> existingPlantOptional = plantRepository.findById(id);
        if (existingPlantOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
        Plant existingPlant = existingPlantOptional.get();

        // Tenant kontrolü
        if (!existingPlant.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Başka tenant'ın verisini değiştirmeye çalışma
        }

        // Referans ID'leri değiştiyse geçerliliğini ve tenant'a aitliğini kontrol et
        // PlantType
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plant.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null);
        }
        existingPlant.setPlantType(plantTypeOptional.get());

        // PlantVariety
        Optional<PlantVariety> plantVarietyOptional = plantVarietyRepository.findById(plant.getPlantVarietyId());
        if (plantVarietyOptional.isEmpty() || !plantVarietyOptional.get().getTenantId().equals(tenantId) || !plantVarietyOptional.get().getPlantTypeId().equals(plant.getPlantTypeId())) {
            return ResponseEntity.badRequest().body(null);
        }
        existingPlant.setPlantVariety(plantVarietyOptional.get());

        // Rootstock
        Optional<Rootstock> rootstockOptional = rootstockRepository.findById(plant.getRootstockId());
        if (rootstockOptional.isEmpty() || !rootstockOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null);
        }
        existingPlant.setRootstock(rootstockOptional.get());

        // PlantSize
        Optional<PlantSize> plantSizeOptional = plantSizeRepository.findById(plant.getPlantSizeId());
        if (plantSizeOptional.isEmpty() || !plantSizeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null);
        }
        existingPlant.setPlantSize(plantSizeOptional.get());

        // PlantAge
        Optional<PlantAge> plantAgeOptional = plantAgeRepository.findById(plant.getPlantAgeId());
        if (plantAgeOptional.isEmpty() || !plantAgeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null);
        }
        existingPlant.setPlantAge(plantAgeOptional.get());

        // Kombinasyon değiştiyse benzersizlik kontrolü (güncellenen objenin kendisi hariç)
        if (!existingPlant.getPlantTypeId().equals(plant.getPlantTypeId()) ||
                !existingPlant.getPlantVarietyId().equals(plant.getPlantVarietyId()) ||
                !existingPlant.getRootstockId().equals(plant.getRootstockId()) ||
                !existingPlant.getPlantSizeId().equals(plant.getPlantSizeId()) ||
                !existingPlant.getPlantAgeId().equals(plant.getPlantAgeId())) {

            if (plantRepository.findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndTenantId(
                    plant.getPlantTypeId(), plant.getPlantVarietyId(), plant.getRootstockId(),
                    plant.getPlantSizeId(), plant.getPlantAgeId(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }
        }
        // ID'leri de güncelle
        existingPlant.setPlantTypeId(plant.getPlantTypeId());
        existingPlant.setPlantVarietyId(plant.getPlantVarietyId());
        existingPlant.setRootstockId(plant.getRootstockId());
        existingPlant.setPlantSizeId(plant.getPlantSizeId());
        existingPlant.setPlantAgeId(plant.getPlantAgeId());


        Plant updatedPlant = plantRepository.save(existingPlant);
        return ResponseEntity.ok(updatedPlant); // 200 OK
    }

    // Fidan Kimliği Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlant(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Plant> existingPlantOptional = plantRepository.findById(id);
        if (existingPlantOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Plant existingPlant = existingPlantOptional.get();

        // Tenant kontrolü
        if (!existingPlant.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantRepository.delete(existingPlant);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}