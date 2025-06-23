package com.fidanlik.fidanysserver.payment.dto;

import com.fidanlik.fidanysserver.payment.model.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    private Payment.PaymentMethod method;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private String description;
    private String customerId; // Tahsilat için
    private String invoiceId;  // Faturaya bağlı tahsilat için
}