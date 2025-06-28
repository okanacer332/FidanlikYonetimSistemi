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
    private Payment.PaymentMethod paymentMethod; // Giderin nasıl ödendiğini belirtir
    private String productionBatchId; // YENİ EKLENEN ALAN
}