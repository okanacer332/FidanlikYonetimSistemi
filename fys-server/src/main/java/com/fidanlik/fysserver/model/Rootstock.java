package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "rootstocks")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true) // name ve tenantId kombinasyonu benzersiz olmalı
public class Rootstock {
    @Id
    private String id;

    private String name; // Anaç adı (örn: M9, M111)

    private String tenantId;
}