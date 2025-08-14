package com.fidanlik.fidanysserver.expense.service;

import com.fidanlik.fidanysserver.expense.dto.ExpenseCategoryRequest;
import com.fidanlik.fidanysserver.expense.dto.ExpenseRequest;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.model.ExpenseCategory;
import com.fidanlik.fidanysserver.expense.repository.ExpenseCategoryRepository;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final PaymentService paymentService;
    private final ProductionBatchRepository productionBatchRepository;

    // --- Expense Category Methods ---

    public ExpenseCategory createCategory(ExpenseCategoryRequest request, String tenantId) {
        ExpenseCategory category = new ExpenseCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setTenantId(tenantId);
        return categoryRepository.save(category);
    }

    public List<ExpenseCategory> getAllCategories(String tenantId) {
        return categoryRepository.findAllByTenantId(tenantId);
    }

    // --- Expense Methods ---

    @Transactional
    public Expense createExpense(ExpenseRequest request, String userId, String tenantId) {
        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gider kategorisi bulunamadı."));

        Expense expense = new Expense();
        expense.setTenantId(tenantId);
        expense.setUserId(userId);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setCategoryId(category.getId()); // YENİ EKLENDİ: categoryId set edildi
        expense.setCategory(category);
        expense.setProductionBatchId(request.getProductionBatchId());

        Expense savedExpense = expenseRepository.save(expense);

        if (request.getProductionBatchId() != null && !request.getProductionBatchId().isEmpty()) {
            ProductionBatch batch = productionBatchRepository.findById(request.getProductionBatchId())
                    .filter(b -> b.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz üretim partisi ID'si."));

            batch.setCostPool(batch.getCostPool().add(request.getAmount()));
            productionBatchRepository.save(batch);
        }

        Payment payment = paymentService.createPaymentForExpense(savedExpense, request.getPaymentMethod(), userId, tenantId);

        savedExpense.setPaymentId(payment.getId());
        return expenseRepository.save(savedExpense);
    }

    public List<Expense> getAllExpenses(String tenantId) {
        return expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId);
    }

    // Belirli bir üretim partisine ait giderleri getirme
    public List<Expense> getExpensesByProductionBatchId(String productionBatchId, String tenantId) {
        List<Expense> expenses = expenseRepository.findAllByProductionBatchIdAndTenantIdOrderByExpenseDateDesc(productionBatchId, tenantId);
        expenses.forEach(expense -> {
            if (expense.getCategoryId() != null) {
                categoryRepository.findById(expense.getCategoryId()).ifPresent(expense::setCategory);
            }
        });
        return expenses;
    }
}