package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.PlantAge;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.PlantAgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/plant-ages")
@RequiredArgsConstructor
public class PlantAgeController {

    private final PlantAgeRepository plantAgeRepository;

    // Fidan Yaşı Ekleme
    @PostMapping
    public ResponseEntity<PlantAge> createPlantAge(@RequestBody PlantAge plantAge) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Aynı tenant içinde aynı isimde fidan yaşı var mı kontrol et
        if (plantAgeRepository.findByNameAndTenantId(plantAge.getName(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        plantAge.setTenantId(tenantId);
        PlantAge savedPlantAge = plantAgeRepository.save(plantAge);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantAge);
    }

    // Tüm Fidan Yaşlarını Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<PlantAge>> getAllPlantAgesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantAge> plantAges = plantAgeRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(plantAges);
    }

    // Fidan Yaşı Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<PlantAge> updatePlantAge(@PathVariable String id, @RequestBody PlantAge plantAge) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantAge> existingPlantAgeOptional = plantAgeRepository.findById(id);
        if (existingPlantAgeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantAge existingPlantAge = existingPlantAgeOptional.get();

        if (!existingPlantAge.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // İsim değişikliği varsa benzersizlik kontrolü
        if (!existingPlantAge.getName().equals(plantAge.getName())) {
            if (plantAgeRepository.findByNameAndTenantId(plantAge.getName(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        existingPlantAge.setName(plantAge.getName());
        PlantAge updatedPlantAge = plantAgeRepository.save(existingPlantAge);
        return ResponseEntity.ok(updatedPlantAge);
    }

    // Fidan Yaşı Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantAge(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantAge> existingPlantAgeOptional = plantAgeRepository.findById(id);
        if (existingPlantAgeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantAge existingPlantAge = existingPlantAgeOptional.get();

        if (!existingPlantAge.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantAgeRepository.delete(existingPlantAge);
        return ResponseEntity.noContent().build();
    }
}