package com.fidanlik.fidanysserver.expense.dto;

import com.fidanlik.fidanysserver.payment.model.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String categoryId;
    private Payment.PaymentMethod paymentMethod;

    // --- YENİ EKLENEN ALAN ---
    private String productionBatchId; // Bu masrafın hangi üretim partisine ait olduğunu belirtir. Opsiyoneldir.
}