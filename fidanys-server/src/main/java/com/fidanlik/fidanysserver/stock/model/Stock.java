// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/model/Stock.java
package com.fidanlik.fidanysserver.stock.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "stocks")
@CompoundIndex(def = "{'plantId': 1, 'warehouseId': 1, 'tenantId': 1}", unique = true)
public class Stock {
    @Id
    private String id;
    private String plantId;
    private String warehouseId;
    private int quantity;
    private String tenantId;
}