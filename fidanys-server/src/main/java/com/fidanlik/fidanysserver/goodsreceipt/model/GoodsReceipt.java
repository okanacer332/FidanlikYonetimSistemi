package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "goodsReceipts")
public class GoodsReceipt {
    @Id
    private String id;
    private String receiptNumber;
    // Eski supplierId alanı kaldırıldı veya ismi değiştirildi, çünkü artık daha genel bir sourceId var.
    // private String supplierId;
    private String warehouseId;
    private List<GoodsReceiptItem> items;
    private BigDecimal totalValue;
    private GoodsReceiptStatus status;
    private String userId;
    private LocalDateTime receiptDate;
    private String tenantId;

    // YENİ EKLENEN ALANLAR
    private SourceType sourceType; // Mal girişinin kaynağı (Tedarikçi mi, Üretim Partisi mi?)
    private String sourceId; // sourceType'a göre ya supplierId ya da productionBatchId

    // Giderin hangi ödeme ile yapıldığını belirtir -> BU ALAN SANIRIM YANLIŞLIKLA GELMİŞ, KALDIRILDI
    // private String paymentId;

    // YENİ ENUM: Mal Giriş Kaynağı
    public enum SourceType {
        SUPPLIER,           // Tedarikçiden gelen mal
        PRODUCTION_BATCH    // Kendi üretim partisinden gelen mal (hasat)
    }

    public enum GoodsReceiptStatus {
        COMPLETED,
        CANCELED
    }
}