// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/dto/ReceiptItemDto.java
package com.fidanlik.fidanysserver.goodsreceipt.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReceiptItemDto {
    private String plantId;
    private int quantity;
    private BigDecimal purchasePrice; // Fidanın alış fiyatı
}