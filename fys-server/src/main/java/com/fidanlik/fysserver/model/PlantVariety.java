package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data
@Document(collection = "plantVarieties")
@CompoundIndex(def = "{'name': 1, 'plantTypeId': 1, 'tenantId': 1}", unique = true) // name, plantType ve tenantId kombinasyonu benzersiz olmalı
public class PlantVariety {
    @Id
    private String id;

    private String name; // Çeşit adı (örn: Gala, Granny Smith)

    private String plantTypeId; // Referans: PlantType ID'si

    @DBRef // İlişkili PlantType objesini tutabiliriz (opsiyonel, frontend'de doldurulabilir)
    private PlantType plantType; // Frontend'e veri gönderirken kolaylık sağlar

    private String tenantId;
}