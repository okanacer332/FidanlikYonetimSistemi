// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/dto/OrderItemDto.java
package com.fidanlik.fidanysserver.order.dto;

import lombok.Data;
import java.math.BigDecimal; // BigDecimal import edildi

@Data
public class OrderItemDto {
    private String plantId;
    private int quantity;
    private BigDecimal salePrice; // Yeni eklendi
}