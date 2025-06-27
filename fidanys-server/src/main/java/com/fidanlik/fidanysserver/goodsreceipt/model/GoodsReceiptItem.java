package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GoodsReceiptItem {
    private String plantId;
    private int quantity;
    private BigDecimal purchasePrice;

    // YENİ EKLENEN ALANLAR
    private boolean isCommercial = true; // Varsayılan olarak ticari mal (al-sat ürünü)
    private String productionBatchId; // Eğer isCommercial false ise, ait olduğu üretim partisinin ID'si
}