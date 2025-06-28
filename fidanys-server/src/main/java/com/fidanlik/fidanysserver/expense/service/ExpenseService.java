package com.fidanlik.fidanysserver.expense.service;

import com.fidanlik.fidanysserver.expense.dto.ExpenseCategoryRequest;
import com.fidanlik.fidanysserver.expense.dto.ExpenseRequest;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.expense.model.ExpenseCategory;
import com.fidanlik.fidanysserver.expense.repository.ExpenseCategoryRepository;
import com.fidanlik.fidanysserver.expense.repository.ExpenseRepository;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import com.fidanlik.fidanysserver.production.model.ProductionBatch; // YENİ IMPORT
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository; // YENİ IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final PaymentService paymentService;
    private final ProductionBatchRepository productionBatchRepository; // YENİ BAĞIMLILIK

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
        expense.setCategory(category);

        // Üretim partisi ID'si varsa, gideri ilgili partiye ata ve maliyet havuzunu güncelle
        if (request.getProductionBatchId() != null && !request.getProductionBatchId().isEmpty()) {
            ProductionBatch productionBatch = productionBatchRepository.findById(request.getProductionBatchId())
                    .filter(pb -> pb.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait üretim partisi ID'si."));

            productionBatch.setCurrentCostPool(productionBatch.getCurrentCostPool().add(request.getAmount()));
            productionBatchRepository.save(productionBatch);

            expense.setProductionBatchId(request.getProductionBatchId()); // Gider objesine partinin ID'sini set et
        }

        Expense savedExpense = expenseRepository.save(expense);

        Payment payment = paymentService.createPaymentForExpense(savedExpense, request.getPaymentMethod(), userId, tenantId);

        savedExpense.setPaymentId(payment.getId());
        return expenseRepository.save(savedExpense); // Güncellenmiş Expense'i (productionBatchId ile) tekrar kaydet
    }

    public List<Expense> getAllExpenses(String tenantId) {
        return expenseRepository.findAllByTenantIdOrderByExpenseDateDesc(tenantId);
    }
}