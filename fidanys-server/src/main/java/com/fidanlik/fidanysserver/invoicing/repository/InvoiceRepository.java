package com.fidanlik.fidanysserver.invoicing.repository;

import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findAllByTenantId(String tenantId);
    boolean existsByOrderId(String orderId);
}