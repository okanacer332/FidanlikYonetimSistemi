package com.fidanlik.fidanysserver.expense.repository;

import com.fidanlik.fidanysserver.expense.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findAllByTenantIdOrderByExpenseDateDesc(String tenantId);
}
