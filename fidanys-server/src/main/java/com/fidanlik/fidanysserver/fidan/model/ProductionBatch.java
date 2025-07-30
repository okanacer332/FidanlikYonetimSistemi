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
    @Indexed(unique = true) // Parti kodu benzersiz olmalı
    private String batchCode; // Yeni: Partinin benzersiz kodu, örn: "PRD-202501-CVZ001"
    private String batchName; // Partinin adı, örn: "Ocak 2025 Aşılı Ceviz Fidanı Partisi"
    private LocalDate startDate; // Partinin doğum tarihi
    private int initialQuantity; // Başlangıçtaki fidan adedi
    private int currentQuantity; // Mevcut fidan adedi (fire düşüldükten sonra)
    private BigDecimal costPool; // Partiye eklenen toplam maliyet (nominal - kaydı yapıldığı andaki değer)
    private String description; // Parti açıklaması

    // Yeni: Enflasyon düzeltilmiş maliyet havuzu
    private BigDecimal inflationAdjustedCostPool;
    // Yeni: Maliyet havuzunun en son ne zaman güncellendiği
    private LocalDate lastCostUpdateDate;
    // Yeni: Üretim partisinden toplanması beklenen toplam fidan adedi (hasat sonrası tahmin)
    private Integer expectedHarvestQuantity;
    // Yeni: Üretim partisinden şimdiye kadar hasat edilen fidan adedi
    private Integer harvestedQuantity;
    // Yeni: Partinin genel durumu (oluşturuldu, büyüyor, hasat edildi, tamamlandı vb.)
    private BatchStatus status;


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

    // Yeni Enum: Parti Durumu
    public enum BatchStatus {
        CREATED,        // Oluşturuldu
        GROWING,        // Büyüyor (Maliyetler eklenmeye devam ediyor)
        HARVESTED,      // Kısmen veya tamamen hasat edildi
        COMPLETED,      // Tamamlandı (Tüm fidanlar hasat edildi veya parti kapatıldı)
        CANCELLED       // İptal edildi
    }
}