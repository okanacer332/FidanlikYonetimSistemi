package com.fidanlik.fidanysserver.expense.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Document(collection = "expenses")
public class Expense {
    @Id
    private String id;
    private String tenantId;
    private String userId;

    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;

    @DBRef
    private ExpenseCategory category;

    private String paymentId; // Giderin hangi ödeme ile yapıldığını belirtir

    // YENİ EKLENEN ALAN
    private String productionBatchId; // Bu giderin ilişkili olduğu üretim partisinin ID'si
}