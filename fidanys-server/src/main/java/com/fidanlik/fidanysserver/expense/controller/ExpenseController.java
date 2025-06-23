package com.fidanlik.fidanysserver.expense.controller;

import com.fidanlik.fidanysserver.expense.dto.ExpenseCategoryRequest;
import com.fidanlik.fidanysserver.expense.dto.ExpenseRequest;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.model.ExpenseCategory;
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

    // --- Expense Categories ---
    @PostMapping("/categories")
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategoryRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ExpenseCategory category = expenseService.createCategory(request, user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseCategory>> getAllCategories(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(expenseService.getAllCategories(user.getTenantId()));
    }

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
}
