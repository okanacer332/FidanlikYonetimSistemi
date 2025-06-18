// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/customer/controller/CustomerController.java
package com.fidanlik.fidanysserver.customer.controller;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.service.CustomerService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
// @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ_PERSONELI')") // <--- KALDIRILDI: Sınıf seviyesi yetkilendirme kaldırıldı.
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    // EKLENDİ: Sadece Yönetici ve Satış Personeli oluşturabilir. Rol adı düzeltildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer, user.getTenantId()));
    }

    @GetMapping
    // EKLENDİ: Yönetici, Satış ve Depo personeli listeleyebilir. Rol adları düzeltildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<List<Customer>> getAllCustomers(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(customerService.getAllCustomersByTenant(user.getTenantId()));
    }

    @GetMapping("/{id}")
    // EKLENDİ: Yönetici, Satış ve Depo personeli detay görebilir. Rol adları düzeltildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(customerService.getCustomerById(id, user.getTenantId()));
    }

    @PutMapping("/{id}")
    // EKLENDİ: Sadece Yönetici ve Satış Personeli güncelleyebilir. Rol adı düzeltildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String id, @RequestBody Customer customerDetails, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Customer updatedCustomer = customerService.updateCustomer(id, customerDetails, user.getTenantId());
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    // BU KURAL DOĞRUYDU, OLDUĞU GİBİ BIRAKILDI: Sadece Yönetici silebilir.
    @PreAuthorize("hasAuthority('ROLE_YÖNETİCİ')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        customerService.deleteCustomer(id, user.getTenantId());
        return ResponseEntity.noContent().build();
    }
}