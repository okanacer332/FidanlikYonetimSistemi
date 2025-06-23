package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public void createCustomerTransaction(String customerId, Transaction.TransactionType type, BigDecimal amount, String description, String relatedDocumentId, String userId, String tenantId) {
        Transaction transaction = Transaction.builder()
                .tenantId(tenantId)
                .transactionDate(LocalDateTime.now())
                .customerId(customerId)
                .type(type)
                .amount(amount)
                .description(description)
                .relatedDocumentId(relatedDocumentId)
                .userId(userId)
                .build();
        transactionRepository.save(transaction);
    }

    public void createSupplierTransaction(String supplierId, Transaction.TransactionType type, BigDecimal amount, String description, String relatedDocumentId, String userId, String tenantId) {
        Transaction transaction = Transaction.builder()
                .tenantId(tenantId)
                .transactionDate(LocalDateTime.now())
                .supplierId(supplierId)
                .type(type)
                .amount(amount)
                .description(description)
                .relatedDocumentId(relatedDocumentId)
                .userId(userId)
                .build();
        transactionRepository.save(transaction);
    }

    public List<Transaction> getCustomerTransactions(String customerId, String tenantId) {
        return transactionRepository.findByCustomerIdAndTenantIdOrderByTransactionDateDesc(customerId, tenantId);
    }

    public List<Transaction> getSupplierTransactions(String supplierId, String tenantId) {
        return transactionRepository.findBySupplierIdAndTenantIdOrderByTransactionDateDesc(supplierId, tenantId);
    }
}