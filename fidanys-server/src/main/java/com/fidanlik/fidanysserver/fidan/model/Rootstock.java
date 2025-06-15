// Yeni konum: src/main/java/com/fidanlik/fidanysserver/fidan/model/Rootstock.java
package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "rootstocks")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true)
public class Rootstock {
    @Id
    private String id;

    private String name;

    private String tenantId;
}