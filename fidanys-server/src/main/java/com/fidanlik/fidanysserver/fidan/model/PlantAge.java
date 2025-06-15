// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/model/PlantAge.java
package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plantAges")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true)
public class PlantAge {
    @Id
    private String id;

    private String name;

    private String tenantId;
}