// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/model/GoodsReceiptItem.java
package com.fidanlik.fidanysserver.goodsreceipt.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GoodsReceiptItem {
    private String plantId;
    private int quantity;
    private BigDecimal purchasePrice;
}