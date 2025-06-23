package com.fidanlik.fidanysserver.customer.repository;

import com.fidanlik.fidanysserver.customer.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends MongoRepository<Customer, String> {

    List<Customer> findAllByTenantId(String tenantId);

    Optional<Customer> findByIdAndTenantId(String id, String tenantId);

    // YENİ EKLENDİ: Anasayfa raporu için gerekli metot.
    long countByTenantId(String tenantId);
}
