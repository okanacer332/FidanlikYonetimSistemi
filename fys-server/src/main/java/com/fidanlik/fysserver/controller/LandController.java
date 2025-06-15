package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.Land;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.LandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/lands")
@RequiredArgsConstructor
public class LandController {

    private final LandRepository landRepository;

    // Arazi Ekleme
    @PostMapping
    public ResponseEntity<Land> createLand(@RequestBody Land land) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Aynı tenant içinde aynı isimde arazi var mı kontrol et
        if (landRepository.findByNameAndTenantId(land.getName(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        land.setTenantId(tenantId);
        Land savedLand = landRepository.save(land);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLand);
    }

    // Tüm Arazileri Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<Land>> getAllLandsByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Land> lands = landRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(lands);
    }

    // Arazi Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<Land> updateLand(@PathVariable String id, @RequestBody Land land) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Land> existingLandOptional = landRepository.findById(id);
        if (existingLandOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Land existingLand = existingLandOptional.get();

        if (!existingLand.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // İsim değişikliği varsa benzersizlik kontrolü
        if (!existingLand.getName().equals(land.getName())) {
            if (landRepository.findByNameAndTenantId(land.getName(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        existingLand.setName(land.getName());
        existingLand.setLocation(land.getLocation()); // Konum bilgisini de güncelleyebiliriz
        Land updatedLand = landRepository.save(existingLand);
        return ResponseEntity.ok(updatedLand);
    }

    // Arazi Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLand(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Land> existingLandOptional = landRepository.findById(id);
        if (existingLandOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Land existingLand = existingLandOptional.get();

        if (!existingLand.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        landRepository.delete(existingLand);
        return ResponseEntity.noContent().build();
    }
}