package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Rootstock;
import com.fidanlik.fidanysserver.fidan.service.RootstockService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Ekledik
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rootstocks")
@RequiredArgsConstructor
public class RootstockController {

    private final RootstockService rootstockService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici oluşturabilir
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

        Rootstock savedRootstock = rootstockService.createRootstock(rootstock, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRootstock);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI', 'ROLE_DEPO SORUMLUSU')") // BURASI DEĞİŞTİ
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

        List<Rootstock> rootstocks = rootstockService.getAllRootstocksByTenant(tenantId);
        return ResponseEntity.ok(rootstocks);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici güncelleyebilir
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

        Rootstock updatedRootstock = rootstockService.updateRootstock(id, rootstock, tenantId);
        return ResponseEntity.ok(updatedRootstock);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')") // Sadece yönetici silebilir
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

        rootstockService.deleteRootstock(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}