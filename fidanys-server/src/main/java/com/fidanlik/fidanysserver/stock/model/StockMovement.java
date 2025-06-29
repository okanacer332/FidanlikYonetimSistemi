package com.fidanlik.fidanysserver.stock.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "stockMovements")
public class StockMovement {
    @Id
    private String id;
    private String plantId;
    private String warehouseId;
    private int quantity; // Giriş için pozitif (+), çıkış için negatif (-)
    private MovementType type;
    private String relatedDocumentId; // İlgili Sipariş, Mal Kabul veya Zayiat kaydının ID'si
    private String description;
    private String userId;
    private LocalDateTime timestamp;
    private String tenantId;
    private String productionBatchId; // YENİ EKLENEN ALAN
    // productionBatchId alanı, bu stok hareketinin hangi üretim partisiyle ilişkili olduğunu belirtir.

    public enum MovementType {
        GOODS_RECEIPT,      // Mal Kabul
        GOODS_RECEIPT_CANCEL,
        SALE,               // Satış
        SALE_CANCEL,        // Satış İptali (İade) -> YENİ EKLENDİ
        WASTAGE,            // Zayiat
        TRANSFER_IN,        // Depo Transfer Girişi
        TRANSFER_OUT,       // Depo Transfer Çıkışı
        RETURN              // Müşteri İadesi (Bu, iptalden farklı bir senaryo için kullanılabilir)
    }
}