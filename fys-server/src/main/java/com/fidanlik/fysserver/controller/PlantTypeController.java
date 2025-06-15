package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.PlantType;
import com.fidanlik.fysserver.model.User; // Mevcut kullanıcıyı almak için User modeli
import com.fidanlik.fysserver.repository.PlantTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // Authentication importu
import org.springframework.security.core.context.SecurityContextHolder; // SecurityContextHolder importu
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/plant-types")
@RequiredArgsConstructor
public class PlantTypeController {

    private final PlantTypeRepository plantTypeRepository;

    // Fidan Türü Ekleme
    @PostMapping
    public ResponseEntity<PlantType> createPlantType(@RequestBody PlantType plantType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kimlik doğrulanmış kullanıcıyı al
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        // Aynı tenant içinde aynı isimde başka bir fidan türü var mı kontrol et
        if (plantTypeRepository.findByNameAndTenantId(plantType.getName(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }

        plantType.setTenantId(tenantId); // TenantId'yi set et
        PlantType savedPlantType = plantTypeRepository.save(plantType);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlantType); // 201 Created
    }

    // Tüm Fidan Türlerini Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<PlantType>> getAllPlantTypesByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kimlik doğrulanmış kullanıcıyı al
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<PlantType> plantTypes = plantTypeRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(plantTypes); // 200 OK
    }

    // Fidan Türü Güncelleme (Opsiyonel, şimdilik sadece ekleme ve listeleme)
    @PutMapping("/{id}")
    public ResponseEntity<PlantType> updatePlantType(@PathVariable String id, @RequestBody PlantType plantType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantType> existingPlantTypeOptional = plantTypeRepository.findById(id);
        if (existingPlantTypeOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }

        PlantType existingPlantType = existingPlantTypeOptional.get();

        // Tenant kontrolü
        if (!existingPlantType.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Başka tenant'ın verisini değiştirmeye çalışma
        }

        // İsim değişikliği varsa benzersizlik kontrolü
        if (!existingPlantType.getName().equals(plantType.getName())) {
            if (plantTypeRepository.findByNameAndTenantId(plantType.getName(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }
        }

        existingPlantType.setName(plantType.getName());
        PlantType updatedPlantType = plantTypeRepository.save(existingPlantType);
        return ResponseEntity.ok(updatedPlantType); // 200 OK
    }

    // Fidan Türü Silme (Opsiyonel)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlantType(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlantType> existingPlantTypeOptional = plantTypeRepository.findById(id);
        if (existingPlantTypeOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }

        PlantType existingPlantType = existingPlantTypeOptional.get();

        // Tenant kontrolü
        if (!existingPlantType.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Başka tenant'ın verisini silmeye çalışma
        }

        plantTypeRepository.delete(existingPlantType);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}