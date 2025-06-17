// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/model/GoodsReceipt.java
package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
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
    private String userId;
    private LocalDateTime receiptDate;
    private String tenantId;
}