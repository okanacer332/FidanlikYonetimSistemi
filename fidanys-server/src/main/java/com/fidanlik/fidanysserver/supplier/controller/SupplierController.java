package com.fidanlik.fidanysserver.supplier.controller;

import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.service.SupplierService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    /**
     * Yeni bir tedarikçi oluşturur. Bu bir iş kararı olduğu için sadece ADMIN tarafından yapılabilir.
     * @param supplier Oluşturulacak tedarikçi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Oluşturulan tedarikçi nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier, @AuthenticationPrincipal User adminUser) {
        Supplier createdSupplier = supplierService.createSupplier(supplier, adminUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupplier);
    }

    /**
     * Bir tenant'a ait tüm tedarikçileri listeler.
     * ADMIN, WAREHOUSE_STAFF (mal kabul için) ve ACCOUNTANT (ödemeler için) erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Tedarikçi listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<List<Supplier>> getAllSuppliers(@AuthenticationPrincipal User authenticatedUser) {
        List<Supplier> suppliers = supplierService.getAllSuppliersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(suppliers);
    }

    /**
     * ID'ye göre tek bir tedarikçinin detaylarını getirir.
     * ADMIN, WAREHOUSE_STAFF ve ACCOUNTANT rollerine sahip kullanıcılar erişebilir.
     * @param id Tedarikçi ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Bulunan tedarikçi nesnesi.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Supplier supplier = supplierService.getSupplierById(id, authenticatedUser.getTenantId());
        return ResponseEntity.ok(supplier);
    }

    /**
     * Mevcut bir tedarikçinin bilgilerini günceller.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Güncellenecek tedarikçi ID'si.
     * @param supplierDetails Yeni tedarikçi bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Güncellenmiş tedarikçi nesnesi.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier supplierDetails, @AuthenticationPrincipal User adminUser) {
        Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails, adminUser.getTenantId());
        return ResponseEntity.ok(updatedSupplier);
    }

    /**
     * Bir tedarikçiyi siler.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Silinecek tedarikçi ID'si.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id, @AuthenticationPrincipal User adminUser) {
        supplierService.deleteSupplier(id, adminUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}