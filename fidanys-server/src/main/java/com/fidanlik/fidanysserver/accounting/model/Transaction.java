package com.fidanlik.fidanysserver.accounting.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private String tenantId;
    private LocalDateTime transactionDate;
    private String customerId; // Borç/Alacak sahibi müşteri
    private String supplierId; // Borç/Alacak sahibi tedarikçi
    // YENİ EKLENEN ALAN
    private String relatedEntityId; // Üretim partisi ID'si gibi ilgili dahili varlık ID'si
    private TransactionType type; // BORC veya ALACAK
    private BigDecimal amount;
    private String description;
    private String relatedDocumentId; // Sipariş, Fatura veya Ödeme ID'si
    private String userId; // İşlemi yapan kullanıcı

    public enum TransactionType {
        DEBIT,  // Borç
        CREDIT  // Alacak
    }
}