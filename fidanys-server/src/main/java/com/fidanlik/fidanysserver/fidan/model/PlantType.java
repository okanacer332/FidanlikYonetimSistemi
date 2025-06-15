// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/model/PlantType.java
package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plantTypes")
public class PlantType {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String tenantId;
}