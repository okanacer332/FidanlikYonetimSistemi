// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/warehouse/model/Warehouse.java
package com.fidanlik.fidanysserver.warehouse.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "warehouses")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true)
public class Warehouse {
    @Id
    private String id;
    private String name;
    private String address;
    private String tenantId;
}