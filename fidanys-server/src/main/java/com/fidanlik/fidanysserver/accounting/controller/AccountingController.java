package com.fidanlik.fidanysserver.accounting.controller;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Bu endpoint'lere sadece admin ve muhasebeci erişebilir
public class AccountingController {

    private final TransactionService transactionService;

    @GetMapping("/customers/{customerId}/transactions")
    public ResponseEntity<List<Transaction>> getCustomerTransactions(@PathVariable String customerId, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getCustomerTransactions(customerId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/suppliers/{supplierId}/transactions")
    public ResponseEntity<List<Transaction>> getSupplierTransactions(@PathVariable String supplierId, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getSupplierTransactions(supplierId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(transactions);
    }
}