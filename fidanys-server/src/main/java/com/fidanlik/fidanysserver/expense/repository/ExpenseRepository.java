package com.fidanlik.fidanysserver.expense.repository;

import com.fidanlik.fidanysserver.expense.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findAllByTenantIdOrderByExpenseDateDesc(String tenantId);

    // YENİ EKLENEN METOT: Belirli bir üretim partisine ait giderleri getirme
    List<Expense> findAllByProductionBatchIdAndTenantIdOrderByExpenseDateDesc(String productionBatchId, String tenantId);
    // Bu metodu ekleyin
    List<Expense> findByTenantIdAndExpenseDateAfter(String tenantId, LocalDate date);
}