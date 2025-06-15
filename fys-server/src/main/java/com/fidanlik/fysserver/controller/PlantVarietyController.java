package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.PlantVariety;
import com.fidanlik.fysserver.model.PlantType; // PlantType referansı için
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.PlantVarietyRepository;
import com.fidanlik.fysserver.repository.PlantTypeRepository; // PlantType için repository
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/plant-varieties")
@RequiredArgsConstructor
public class PlantVarietyController {

    private final PlantVarietyRepository plantVarietyRepository;
    private final PlantTypeRepository plantTypeRepository; // PlantType kontrolü için

    // Fidan Çeşidi Ekleme
    @PostMapping
    public ResponseEntity<PlantVariety> createPlantVariety(@RequestBody PlantVariety plantVariety) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et
        if (plantVariety.getPlantTypeId() == null || plantVariety.getPlantTypeId().isEmpty()) {
            return ResponseEntity.badRequest().body(null); // PlantType ID eksik
        }
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantVariety.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait PlantType
        }

        // Aynı tenant ve PlantType altında aynı isimde çeşit var mı kontrol et
        if (plantVarietyRepository.findByNameAndPlantTypeIdAndTenantId(plantVariety.getName(), plantVariety.getPlantTypeId(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        plantVariety.setTenantId(tenantId);
        plantVariety.setPlantType(plantTypeOptional.get()); // PlantType objesini de set et (DBRef için)
        PlantVariety savedPlantVariety = plantVarietyRepository.save(plantVariety);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantVariety);
    }

    // Tüm Fidan Çeşitlerini Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<PlantVariety>> getAllPlantVarietiesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantVariety> plantVarieties = plantVarietyRepository.findAllByTenantId(tenantId);
        // DBRef ile çekilen PlantType objelerinin null olup olmadığını kontrol et (eğer lazy loading oluyorsa)
        plantVarieties.forEach(pv -> {
            if (pv.getPlantType() == null && pv.getPlantTypeId() != null) {
                plantTypeRepository.findById(pv.getPlantTypeId()).ifPresent(pv::setPlantType);
            }
        });
        return ResponseEntity.ok(plantVarieties);
    }

    // Belirli bir Fidan Türüne ait Çeşitleri Listeleme (Tenant bazında)
    @GetMapping("/by-plant-type/{plantTypeId}")
    public ResponseEntity<List<PlantVariety>> getPlantVarietiesByPlantTypeAndTenant(@PathVariable String plantTypeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantTypeId);
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null); // Geçersiz veya başka tenant'a ait PlantType
        }

        List<PlantVariety> plantVarieties = plantVarietyRepository.findAllByPlantTypeIdAndTenantId(plantTypeId, tenantId);
        // DBRef ile çekilen PlantType objelerinin null olup olmadığını kontrol et
        plantVarieties.forEach(pv -> {
            if (pv.getPlantType() == null && pv.getPlantTypeId() != null) {
                plantTypeRepository.findById(pv.getPlantTypeId()).ifPresent(pv::setPlantType);
            }
        });
        return ResponseEntity.ok(plantVarieties);
    }


    // Fidan Çeşidi Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<PlantVariety> updatePlantVariety(@PathVariable String id, @RequestBody PlantVariety plantVariety) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantVariety> existingPlantVarietyOptional = plantVarietyRepository.findById(id);
        if (existingPlantVarietyOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantVariety existingPlantVariety = existingPlantVarietyOptional.get();

        if (!existingPlantVariety.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et (değişmediyse bile güvenlik)
        if (plantVariety.getPlantTypeId() == null || plantVariety.getPlantTypeId().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantVariety.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            return ResponseEntity.badRequest().body(null);
        }

        // İsim veya PlantType değişikliği varsa benzersizlik kontrolü
        if (!existingPlantVariety.getName().equals(plantVariety.getName()) || !existingPlantVariety.getPlantTypeId().equals(plantVariety.getPlantTypeId())) {
            if (plantVarietyRepository.findByNameAndPlantTypeIdAndTenantId(plantVariety.getName(), plantVariety.getPlantTypeId(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        existingPlantVariety.setName(plantVariety.getName());
        existingPlantVariety.setPlantTypeId(plantVariety.getPlantTypeId());
        existingPlantVariety.setPlantType(plantTypeOptional.get()); // Güncel PlantType objesini set et

        PlantVariety updatedPlantVariety = plantVarietyRepository.save(existingPlantVariety);
        return ResponseEntity.ok(updatedPlantVariety);
    }

    // Fidan Çeşidi Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantVariety(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantVariety> existingPlantVarietyOptional = plantVarietyRepository.findById(id);
        if (existingPlantVarietyOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PlantVariety existingPlantVariety = existingPlantVarietyOptional.get();

        if (!existingPlantVariety.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantVarietyRepository.delete(existingPlantVariety);
        return ResponseEntity.noContent().build();
    }
}