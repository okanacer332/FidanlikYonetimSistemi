// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/customer/service/CustomerService.java
package com.fidanlik.fidanysserver.customer.service;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Customer createCustomer(Customer customer, String tenantId) {
        customer.setTenantId(tenantId);
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomersByTenant(String tenantId) {
        return customerRepository.findAllByTenantId(tenantId);
    }

    public Customer getCustomerById(String id, String tenantId) {
        return customerRepository.findById(id)
                .filter(customer -> customer.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Müşteri bulunamadı."));
    }

    // Gerekirse update ve delete metotları da benzer şekilde eklenebilir.
}