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
@PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI')")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer, user.getTenantId()));
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(customerService.getAllCustomersByTenant(user.getTenantId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(customerService.getCustomerById(id, user.getTenantId()));
    }
}