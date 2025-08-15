package com.fidanlik.fidanysserver.expense.controller;

import com.fidanlik.fidanysserver.expense.dto.ExpenseCategoryRequest;
import com.fidanlik.fidanysserver.expense.model.ExpenseCategory;
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
@RequestMapping("/api/v1/expense-categories")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Class-level security for this sub-module
public class ExpenseCategoryController {

    private final ExpenseService expenseService;

    /**
     * Bir tenant'a ait tüm masraf kategorilerini listeler.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Masraf kategorileri listesi.
     */
    @GetMapping
    public ResponseEntity<List<ExpenseCategory>> getAllCategories(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(expenseService.getAllCategories(authenticatedUser.getTenantId()));
    }

    /**
     * Yeni bir masraf kategorisi oluşturur.
     * @param request Kategori oluşturma isteği.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan kategori nesnesi.
     */
    @PostMapping
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategoryRequest request, @AuthenticationPrincipal User authenticatedUser) {
        ExpenseCategory category = expenseService.createCategory(request, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }
}