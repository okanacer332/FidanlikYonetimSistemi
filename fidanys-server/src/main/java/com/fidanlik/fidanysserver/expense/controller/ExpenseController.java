package com.fidanlik.fidanysserver.expense.controller;

import com.fidanlik.fidanysserver.expense.dto.ExpenseRequest;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.service.ExpenseService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Class-level security for the entire module
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Yeni bir masraf kaydı oluşturur.
     * @param request Masraf oluşturma isteği.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan masraf nesnesi.
     */
    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequest request, @AuthenticationPrincipal User authenticatedUser) {
        Expense expense = expenseService.createExpense(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    /**
     * Bir tenant'a ait tüm masrafları listeler.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Masraf listesi.
     */
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(expenseService.getAllExpenses(authenticatedUser.getTenantId()));
    }

    /**
     * Belirli bir üretim partisine ait masrafları listeler.
     * @param productionBatchId Üretim partisi ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Masraf listesi.
     */
    @GetMapping("/by-batch/{productionBatchId}")
    public ResponseEntity<List<Expense>> getExpensesByProductionBatchId(
            @PathVariable String productionBatchId,
            @AuthenticationPrincipal User authenticatedUser) {
        List<Expense> expenses = expenseService.getExpensesByProductionBatchId(productionBatchId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(expenses);
    }
}