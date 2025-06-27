package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Document(collection = "production_batches")
public class ProductionBatch {
    @Id
    private String id;
    private String batchName; // Partinin adı, örn: "Ocak 2025 Aşılı Ceviz Fidanı Partisi"
    private LocalDate startDate; // Partinin doğum tarihi
    private int initialQuantity; // Başlangıçtaki fidan adedi
    private int currentQuantity; // Mevcut fidan adedi (fire düşüldükten sonra)
    private BigDecimal costPool; // Partiye eklenen toplam maliyet (nominal)
    private String description; // Parti açıklaması

    // Üretim Partisi hangi fidan türü/çeşidi için açıldı bilgisi (DBRef yerine ID tutalım)
    private String plantTypeId;
    private String plantVarietyId;

    // DBRef'ler (opsiyonel, gerekirse servis katmanında doldurulur)
    @DBRef
    private PlantType plantType;
    @DBRef
    private PlantVariety plantVariety;

    @Indexed
    private String tenantId;

    // Yeni eklenecek alanlar için yer tutucular (ilerleyen adımlarda eklenecek)
    // private BigDecimal inflationAdjustedCostPool;
    // private LocalDate lastCostUpdateDate;
}