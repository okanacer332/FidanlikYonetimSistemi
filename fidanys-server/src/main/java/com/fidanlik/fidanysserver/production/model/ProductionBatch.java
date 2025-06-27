package com.fidanlik.fidanysserver.production.model;

import com.fasterxml.jackson.annotation.JsonProperty; // YENİ IMPORT
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.math.RoundingMode; // YENİ IMPORT
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

    // --- YENİ EKLENEN METOT ---
    @JsonProperty("unitCost") // API yanıtında bu isimle görünmesini sağlar
    public BigDecimal getUnitCost() {
        // Eğer miktar 0 ise veya maliyet 0 ise, sıfıra bölme hatasını önlemek için 0 dön.
        if (currentQuantity <= 0 || totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        // Toplam Maliyeti / Güncel Miktara böl. Virgülden sonra 2 hane al ve en yakına yuvarla.
        return totalCost.divide(new BigDecimal(currentQuantity), 2, RoundingMode.HALF_UP);
    }
}