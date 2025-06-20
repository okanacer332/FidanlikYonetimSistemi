package com.fidanlik.fidanysserver.warehouse.controller;

import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
import com.fidanlik.fidanysserver.warehouse.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Warehouse createdWarehouse = warehouseService.createWarehouse(warehouse, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWarehouse);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Warehouse>> getAllWarehouses(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Warehouse> warehouses = warehouseService.getAllWarehousesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(warehouses);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable String id, @RequestBody Warehouse warehouseDetails, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Warehouse updatedWarehouse = warehouseService.updateWarehouse(id, warehouseDetails, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedWarehouse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        warehouseService.deleteWarehouse(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}