// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/model/PlantVariety.java
package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef; // DBRef importu

@Data
@Document(collection = "plantVarieties")
@CompoundIndex(def = "{'name': 1, 'plantTypeId': 1, 'tenantId': 1}", unique = true)
public class PlantVariety {
    @Id
    private String id;

    private String name;

    private String plantTypeId;

    @DBRef
    private PlantType plantType; // Yeni paket yolu

    private String tenantId;
}