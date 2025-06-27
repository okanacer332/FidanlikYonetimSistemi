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

    // --- YENİ EKLENEN ALANLAR ---
    private StockType type;
    private String productionBatchId; // Eğer type = IN_PRODUCTION ise dolu olacak

    public enum StockType {
        COMMERCIAL,       // Ticari Mal (Al-Sat)
        IN_PRODUCTION     // Üretim Partisi
    }
    // --- BİTİŞ ---
}