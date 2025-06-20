package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal; // Import BigDecimal
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "goodsReceipts")
public class GoodsReceipt {
    @Id
    private String id;
    private String receiptNumber;
    private String supplierId;
    private String warehouseId;
    private List<GoodsReceiptItem> items;
    private BigDecimal totalValue; // ADD THIS FIELD
    private GoodsReceiptStatus status; // ADD THIS FIELD
    private String userId;
    private LocalDateTime receiptDate;
    private String tenantId;

    // ADD THIS ENUM
    public enum GoodsReceiptStatus {
        COMPLETED,
        CANCELED
    }
}