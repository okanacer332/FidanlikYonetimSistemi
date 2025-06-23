package com.fidanlik.fidanysserver.expense.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "expense_categories")
public class ExpenseCategory {
    @Id
    private String id;
    private String name;
    private String description;
    private String tenantId;
}
