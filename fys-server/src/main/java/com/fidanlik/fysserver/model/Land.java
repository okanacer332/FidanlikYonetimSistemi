package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "lands")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true) // name ve tenantId kombinasyonu benzersiz olmalı
public class Land {
    @Id
    private String id;

    private String name; // Arazi/depo adı (örn: A Parsel, Merkez Depo)
    private String location; // Konum bilgisi (örn: Tarsus, Mersin)

    private String tenantId;
}