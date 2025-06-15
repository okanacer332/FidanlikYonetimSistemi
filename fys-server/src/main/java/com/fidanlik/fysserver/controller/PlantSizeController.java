package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.PlantSize;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.PlantSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/plant-sizes")
@RequiredArgsConstructor
public class PlantSizeController {

    private final PlantSizeRepository plantSizeRepository;

    // Fidan Boyu Ekleme
    @PostMapping
    public ResponseEntity<PlantSize> createPlantSize(@RequestBody PlantSize plantSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Aynı tenant içinde aynı isimde fidan boyu var mı kontrol et
        if (plantSizeRepository.findByNameAndTenantId(plantSize.getName(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        plantSize.setTenantId(tenantId);
        PlantSize savedPlantSize = plantSizeRepository.save(plantSize);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantSize);
    }

    // Tüm Fidan Boylarını Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<PlantSize>> getAllPlantSizesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantSize> plantSizes = plantSizeRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(plantSizes);
    }

    // Fidan Boyu Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<PlantSize> updatePlantSize(@PathVariable String id, @RequestBody PlantSize plantSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantSize> existingPlantSizeOptional = plantSizeRepository.findById(id);
        if (existingPlantSizeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantSize existingPlantSize = existingPlantSizeOptional.get();

        if (!existingPlantSize.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // İsim değişikliği varsa benzersizlik kontrolü
        if (!existingPlantSize.getName().equals(plantSize.getName())) {
            if (plantSizeRepository.findByNameAndTenantId(plantSize.getName(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        existingPlantSize.setName(plantSize.getName());
        PlantSize updatedPlantSize = plantSizeRepository.save(existingPlantSize);
        return ResponseEntity.ok(updatedPlantSize);
    }

    // Fidan Boyu Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantSize(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantSize> existingPlantSizeOptional = plantSizeRepository.findById(id);
        if (existingPlantSizeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantSize existingPlantSize = existingPlantSizeOptional.get();

        if (!existingPlantSize.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantSizeRepository.delete(existingPlantSize);
        return ResponseEntity.noContent().build();
    }
}