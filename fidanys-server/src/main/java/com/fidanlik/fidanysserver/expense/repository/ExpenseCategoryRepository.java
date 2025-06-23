package com.fidanlik.fidanysserver.expense.repository;

import com.fidanlik.fidanysserver.expense.model.ExpenseCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExpenseCategoryRepository extends MongoRepository<ExpenseCategory, String> {
    List<ExpenseCategory> findAllByTenantId(String tenantId);
}
