// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/customer/service/CustomerService.java
package com.fidanlik.fidanysserver.customer.service;

import com.fidanlik.fidanysserver.customer.model.Customer;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional; // Import for Optional

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Customer createCustomer(Customer customer, String tenantId) {
        customer.setTenantId(tenantId);
        // Müşteri adı veya e-posta benzersizliği gibi ek kontroller burada yapılabilir
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

    // Yeni eklenecek metot: Müşteri güncelleme
    public Customer updateCustomer(String id, Customer customerDetails, String tenantId) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek müşteri bulunamadı."));

        if (!existingCustomer.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin müşterisini güncellemeye yetkiniz yok.");
        }

        // Güncelleme alanları: Sadece null olmayan değerleri güncelle
        if (customerDetails.getFirstName() != null) {
            existingCustomer.setFirstName(customerDetails.getFirstName());
        }
        if (customerDetails.getLastName() != null) {
            existingCustomer.setLastName(customerDetails.getLastName());
        }
        if (customerDetails.getCompanyName() != null) {
            existingCustomer.setCompanyName(customerDetails.getCompanyName());
        }
        if (customerDetails.getPhone() != null) {
            existingCustomer.setPhone(customerDetails.getPhone());
        }
        if (customerDetails.getEmail() != null) {
            existingCustomer.setEmail(customerDetails.getEmail());
        }
        if (customerDetails.getAddress() != null) {
            existingCustomer.setAddress(customerDetails.getAddress());
        }

        return customerRepository.save(existingCustomer);
    }

    // Yeni eklenecek metot: Müşteri silme
    public void deleteCustomer(String id, String tenantId) {
        Customer customerToDelete = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek müşteri bulunamadı."));

        if (!customerToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin müşterisini silmeye yetkiniz yok.");
        }

        // İleride bu müşteriye bağlı siparişler varsa silmeyi engellemek için bir kontrol eklenebilir.
        customerRepository.delete(customerToDelete);
    }
}