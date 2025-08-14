package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GoodsReceiptItem {
    private String plantId;
    private int quantity;
    // 'purchasePrice' yerine daha genel 'unitCost' kullanıldı
    private BigDecimal unitCost; // Malın birim maliyeti (alış fiyatı veya üretim birim maliyeti)

    // Bu alanların ismi daha açıklayıcı hale getirildi.
    // 'isCommercial' yerine 'sourceType' enum'ı kullanılacağı için bu alan gereksizleşti.
    // Artık GoodsReceipt modelindeki 'sourceType' ve 'sourceId' alanları bu ayrımı yapacak.
    // private boolean isCommercial = true;
    // 'productionBatchId' zaten GoodsReceipt'in sourceId'si olacak. Eğer bir kalem özelinde farklı bir batch id'si gerekiyorsa tutulabilir, ancak şimdilik genel GoodsReceipt'teki yeterli kabul ediliyor.
    // private String productionBatchId;
}