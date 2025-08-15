package com.fidanlik.fidanysserver.customer.controller;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.service.CustomerService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Yeni bir müşteri oluşturur.
     * Sadece ADMIN ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param customer Oluşturulacak müşteri bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı (otomatik olarak enjekte edilir).
     * @return Oluşturulan müşteri nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer, @AuthenticationPrincipal User authenticatedUser) {
        Customer createdCustomer = customerService.createCustomer(customer, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }

    /**
     * Bir tenant'a ait tüm müşterileri listeler.
     * ADMIN, SALES ve ACCOUNTANT rollerine sahip kullanıcılar erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Müşteri listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<List<Customer>> getAllCustomers(@AuthenticationPrincipal User authenticatedUser) {
        List<Customer> customers = customerService.getAllCustomersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(customers);
    }

    /**
     * Belirli bir müşterinin detaylarını ID'ye göre getirir.
     * ADMIN, SALES ve ACCOUNTANT rollerine sahip kullanıcılar erişebilir.
     * @param id Müşteri ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Bulunan müşteri nesnesi.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Customer customer = customerService.getCustomerById(id, authenticatedUser.getTenantId());
        return ResponseEntity.ok(customer);
    }

    /**
     * Mevcut bir müşterinin bilgilerini günceller.
     * Sadece ADMIN ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param id Güncellenecek müşteri ID'si.
     * @param customerDetails Yeni müşteri bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Güncellenmiş müşteri nesnesi.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String id, @RequestBody Customer customerDetails, @AuthenticationPrincipal User authenticatedUser) {
        Customer updatedCustomer = customerService.updateCustomer(id, customerDetails, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedCustomer);
    }

    /**
     * Bir müşteriyi siler.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param id Silinecek müşteri ID'si.
     * @param authenticatedUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        customerService.deleteCustomer(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}