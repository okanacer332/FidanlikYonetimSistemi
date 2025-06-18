// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/supplier/controller/SupplierController.java
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
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Supplier createdSupplier = supplierService.createSupplier(supplier, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupplier);
    }

    @GetMapping
    // DÜZELTİLDİ: 'ROLE_SATIŞ PERSONELI' -> 'ROLE_SATIŞ PERSONELİ' olarak değiştirildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_DEPO SORUMLUSU', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<List<Supplier>> getAllSuppliers(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Supplier> suppliers = supplierService.getAllSuppliersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(suppliers);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier supplierDetails, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedSupplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        supplierService.deleteSupplier(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}