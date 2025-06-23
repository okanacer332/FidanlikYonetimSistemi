package com.fidanlik.fidanysserver.invoicing.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String tenantId;
    private String invoiceNumber;
    private String customerId;
    private String orderId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private List<InvoiceItem> items;
    private String userId;

    public enum InvoiceStatus {
        DRAFT,      // Taslak
        SENT,       // Gönderildi
        PAID,       // Ödendi
        CANCELED    // İptal Edildi
    }
}