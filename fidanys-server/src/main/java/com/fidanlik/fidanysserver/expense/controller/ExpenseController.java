package com.fidanlik.fidanysserver.expense.controller;

import com.fidanlik.fidanysserver.expense.dto.ExpenseRequest;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.service.ExpenseService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
public class ExpenseController {

    private final ExpenseService expenseService;

    // --- Expense Categories ile ilgili metotlar buradaydı, şimdi kaldırıldı ---


    // --- Expenses ---
    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Expense expense = expenseService.createExpense(request, user.getId(), user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(expenseService.getAllExpenses(user.getTenantId()));
    }

    // YENİ EKLENEN ENDPOINT: Belirli bir üretim partisine ait giderleri getirme
    @GetMapping("/by-batch/{productionBatchId}")
    public ResponseEntity<List<Expense>> getExpensesByProductionBatchId(
            @PathVariable String productionBatchId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Expense> expenses = expenseService.getExpensesByProductionBatchId(productionBatchId, user.getTenantId());
        return ResponseEntity.ok(expenses);
    }
}