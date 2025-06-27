package com.fidanlik.fidanysserver.production.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Data
@Document(collection = "production_batches")
public class ProductionBatch {

    @Id
    private String id;
    private String batchName;
    private String plantId;

    @Transient
    private String plantName;
    @Transient
    private String batchCode;

    private int initialQuantity;
    private int currentQuantity;
    private LocalDate birthDate; // Alan adı orijinal haline (birthDate) geri döndürüldü.
    private BigDecimal totalCost = BigDecimal.ZERO;
    private String tenantId;
    private BatchStatus status;

    public enum BatchStatus {
        ACTIVE,
        COMPLETED,
        CLOSED
    }

    @JsonProperty("unitCost")
    @Transient
    public BigDecimal getUnitCost() {
        if (currentQuantity <= 0 || totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return totalCost.divide(new BigDecimal(currentQuantity), 2, RoundingMode.HALF_UP);
    }
}