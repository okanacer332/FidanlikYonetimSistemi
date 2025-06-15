package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plantAges")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true) // name ve tenantId kombinasyonu benzersiz olmalı
public class PlantAge {
    @Id
    private String id;

    private String name; // Fidan yaşı adı (örn: 1 Yaş, 2 Yaş)

    private String tenantId;
}