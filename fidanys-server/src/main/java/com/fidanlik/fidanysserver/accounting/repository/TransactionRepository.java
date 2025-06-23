package com.fidanlik.fidanysserver.accounting.repository;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByCustomerIdAndTenantIdOrderByTransactionDateDesc(String customerId, String tenantId);
    List<Transaction> findBySupplierIdAndTenantIdOrderByTransactionDateDesc(String supplierId, String tenantId);
}