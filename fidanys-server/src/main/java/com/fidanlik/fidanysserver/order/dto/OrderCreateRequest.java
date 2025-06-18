// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/dto/OrderCreateRequest.java
package com.fidanlik.fidanysserver.order.dto;

import lombok.Data;
import java.time.LocalDateTime; // LocalDateTime import edildi
import java.util.List;

@Data
public class OrderCreateRequest {
    private String customerId;
    private String warehouseId;
    private String deliveryAddress; // Bu alan Order modelinde yok, isterseniz kaldırabilirsiniz.
    private List<OrderItemDto> items;
    private LocalDateTime expectedDeliveryDate; // Yeni eklendi
}