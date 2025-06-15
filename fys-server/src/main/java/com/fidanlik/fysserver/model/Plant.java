package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plants") // MongoDB koleksiyon adı
// name, plantType, variety, rootstock, size, age ve tenant ID kombinasyonu benzersiz olmalı
// uniqueKey yerine doğrudan bu alanları compound index yaparak benzersizliği sağlarız.
@CompoundIndex(def = "{'plantTypeId': 1, 'plantVarietyId': 1, 'rootstockId': 1, 'plantSizeId': 1, 'plantAgeId': 1, 'tenantId': 1}", unique = true)
public class Plant {
    @Id
    private String id; // Otomatik oluşturulan benzersiz ID

    // Fidan Özelliklerine Referanslar (ID'ler)
    private String plantTypeId;
    private String plantVarietyId;
    private String rootstockId;
    private String plantSizeId;
    private String plantAgeId;

    // Frontend'e dolu objeleri göndermek için DBRef
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

    private String tenantId; // Hangi şirkete ait olduğu

    // uniqueKey alanına artık doğrudan CompoundIndex ile gerek kalmaz.
    // Ancak, hızlı arama için string birleştirme hala faydalı olabilir,
    // eğer sadece tek bir alan üzerinden arama yapılması gerekiyorsa.
    // Şimdilik, CompoundIndex yeterli.
}