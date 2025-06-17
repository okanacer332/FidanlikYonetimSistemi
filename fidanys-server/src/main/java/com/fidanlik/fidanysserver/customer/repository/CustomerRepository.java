// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/customer/repository/CustomerRepository.java
package com.fidanlik.fidanysserver.customer.repository;

import com.fidanlik.fidanysserver.customer.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CustomerRepository extends MongoRepository<Customer, String> {
    List<Customer> findAllByTenantId(String tenantId);
}