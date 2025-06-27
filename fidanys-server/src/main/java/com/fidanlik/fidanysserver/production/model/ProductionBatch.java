package com.fidanlik.fidanysserver.production.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Document(collection = "production_batches")
public class ProductionBatch {

    @Id
    private String id;
    private String batchName; // Örn: "Ocak 2025 Aşılı Ceviz Partisi"
    private String plantId; // Hangi fidan kimliğinin üretildiği
    private int initialQuantity; // Başlangıçtaki fidan sayısı
    private int currentQuantity; // Güncel sağlam fidan sayısı
    private LocalDate birthDate; // Partinin başlangıç tarihi
    private BigDecimal totalCost = BigDecimal.ZERO; // Bu partiye atanan tüm maliyetlerin toplamı
    private String tenantId;
    private BatchStatus status;

    public enum BatchStatus {
        ACTIVE,
        COMPLETED
    }
}