// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/dto/GoodsReceiptRequest.java
package com.fidanlik.fidanysserver.goodsreceipt.dto;

import lombok.Data;
import java.util.List;

@Data
public class GoodsReceiptRequest {
    private String receiptNumber; // İrsaliye Numarası
    private String supplierId;
    private String warehouseId;
    private List<ReceiptItemDto> items;
}