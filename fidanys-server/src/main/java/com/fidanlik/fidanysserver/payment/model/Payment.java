package com.fidanlik.fidanysserver.payment.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    private String tenantId;
    private String userId;

    private PaymentType type;       // TAHSILAT, TEDIYE
    private PaymentMethod method;   // NAKIT, BANKA_TRANSFERI, KREDI_KARTI
    private LocalDate paymentDate;
    private BigDecimal amount;
    private String description;

    // İlişkili olduğu belge
    private String relatedId;       // Müşteri ID'si, Tedarikçi ID'si veya Gider ID'si olabilir
    private RelatedEntityType relatedEntityType; // CUSTOMER, SUPPLIER, EXPENSE

    private String invoiceId;       // Eğer bir faturaya istinaden yapıldıysa

    public enum PaymentType {
        COLLECTION, // Tahsilat (Para Girişi)
        PAYMENT     // Tediye (Para Çıkışı)
    }

    public enum PaymentMethod {
        CASH,
        BANK_TRANSFER,
        CREDIT_CARD
    }

    public enum RelatedEntityType {
        CUSTOMER,
        SUPPLIER,
        EXPENSE
    }
}