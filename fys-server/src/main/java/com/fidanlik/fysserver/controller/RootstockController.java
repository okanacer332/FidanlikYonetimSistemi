package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.Rootstock;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.RootstockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/rootstocks")
@RequiredArgsConstructor
public class RootstockController {

    private final RootstockRepository rootstockRepository;

    // Anaç Ekleme
    @PostMapping
    public ResponseEntity<Rootstock> createRootstock(@RequestBody Rootstock rootstock) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Aynı tenant içinde aynı isimde anaç var mı kontrol et
        if (rootstockRepository.findByNameAndTenantId(rootstock.getName(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        rootstock.setTenantId(tenantId);
        Rootstock savedRootstock = rootstockRepository.save(rootstock);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRootstock);
    }

    // Tüm Anaçları Listeleme (Tenant bazında)
    @GetMapping
    public ResponseEntity<List<Rootstock>> getAllRootstocksByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Rootstock> rootstocks = rootstockRepository.findAllByTenantId(tenantId);
        return ResponseEntity.ok(rootstocks);
    }

    // Anaç Güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<Rootstock> updateRootstock(@PathVariable String id, @RequestBody Rootstock rootstock) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Rootstock> existingRootstockOptional = rootstockRepository.findById(id);
        if (existingRootstockOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Rootstock existingRootstock = existingRootstockOptional.get();

        if (!existingRootstock.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // İsim değişikliği varsa benzersizlik kontrolü
        if (!existingRootstock.getName().equals(rootstock.getName())) {
            if (rootstockRepository.findByNameAndTenantId(rootstock.getName(), tenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        existingRootstock.setName(rootstock.getName());
        Rootstock updatedRootstock = rootstockRepository.save(existingRootstock);
        return ResponseEntity.ok(updatedRootstock);
    }

    // Anaç Silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRootstock(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Rootstock> existingRootstockOptional = rootstockRepository.findById(id);
        if (existingRootstockOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Rootstock existingRootstock = existingRootstockOptional.get();

        if (!existingRootstock.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        rootstockRepository.delete(existingRootstock);
        return ResponseEntity.noContent().build();
    }
}