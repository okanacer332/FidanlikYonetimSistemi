package com.fidanlik.fidanysserver.supplier.controller;

import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Supplier createdSupplier = supplierService.createSupplier(supplier, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupplier);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<List<Supplier>> getAllSuppliers(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Supplier> suppliers = supplierService.getAllSuppliersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(suppliers);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier supplierDetails, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedSupplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        supplierService.deleteSupplier(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable String id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(supplierService.getSupplierById(id, user.getTenantId()));
    }
}