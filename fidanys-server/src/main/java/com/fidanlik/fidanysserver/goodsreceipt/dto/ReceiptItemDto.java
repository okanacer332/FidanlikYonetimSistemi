package com.fidanlik.fidanysserver.goodsreceipt.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReceiptItemDto {
    private String plantId;
    private int quantity;
    // 'purchasePrice' yerine daha genel 'unitCost' kullanıldı
    private BigDecimal unitCost; // Fidanın birim maliyeti (alış fiyatı veya üretim birim maliyeti)

    // 'isCommercial' ve 'productionBatchId' alanları kaldırıldı,
    // çünkü bu bilgiler GoodsReceiptRequest'teki sourceType ve sourceId tarafından yönetilecek.
    // private boolean isCommercial = true;
    // private String productionBatchId;
}