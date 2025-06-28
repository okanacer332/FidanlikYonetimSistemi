package com.fidanlik.fidanysserver.production.model;

import com.fidanlik.fidanysserver.fidan.model.*; // Fidan altındaki modelleri import ediyoruz
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Document(collection = "productionBatches")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true) // Parti adı tenant içinde benzersiz olmalı
public class ProductionBatch {
    @Id
    private String id;

    private String name;
    private LocalDate birthDate; // Partinin oluşturulduğu tarih
    private int initialPlantQuantity; // Başlangıçtaki fidan adedi
    private int currentPlantQuantity; // Mevcut fidan adedi (fire düşüldükçe azalacak)
    private BigDecimal currentCostPool; // Partiye atanan toplam maliyet

    // Fidan Kimliği Referansları
    private String plantTypeId;
    private String plantVarietyId;
    private String rootstockId;
    private String plantSizeId;
    private String plantAgeId;
    private String landId;

    // DBRef ile ilişkili objeler (otomatik doldurulacak)
    @DBRef
    private PlantType plantType;
    @DBRef
    private PlantVariety plantVariety;
    @DBRef
    private Rootstock rootstock;
    @DBRef
    private PlantSize plantSize;
    @DBRef
    private PlantAge plantAge;
    @DBRef
    private Land land;

    private String tenantId;
}