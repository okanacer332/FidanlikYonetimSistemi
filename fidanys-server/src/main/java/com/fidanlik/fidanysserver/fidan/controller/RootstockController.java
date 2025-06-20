package com.fidanlik.fidanysserver.fidan.controller;

import com.fidanlik.fidanysserver.fidan.model.Rootstock;
import com.fidanlik.fidanysserver.fidan.service.RootstockService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rootstocks")
@RequiredArgsConstructor
public class RootstockController {

    private final RootstockService rootstockService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Rootstock> createRootstock(@RequestBody Rootstock rootstock, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Rootstock savedRootstock = rootstockService.createRootstock(rootstock, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRootstock);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Rootstock>> getAllRootstocksByTenant(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        List<Rootstock> rootstocks = rootstockService.getAllRootstocksByTenant(tenantId);
        return ResponseEntity.ok(rootstocks);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Rootstock> updateRootstock(@PathVariable String id, @RequestBody Rootstock rootstock, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        Rootstock updatedRootstock = rootstockService.updateRootstock(id, rootstock, tenantId);
        return ResponseEntity.ok(updatedRootstock);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteRootstock(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();
        rootstockService.deleteRootstock(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}