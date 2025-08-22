package com.fidanlik.fidanysserver.invoicing.repository;

import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findAllByTenantId(String tenantId);
    boolean existsByOrderId(String orderId);
    List<Invoice> findByTenantIdAndStatusNotAndDueDateBefore(String tenantId, Invoice.InvoiceStatus status, LocalDate date);
    List<Invoice> findAllByTenantIdAndIssueDateBetween(String tenantId, LocalDate startDate, LocalDate endDate);

}