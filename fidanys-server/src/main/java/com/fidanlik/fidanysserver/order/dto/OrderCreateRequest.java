// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/dto/OrderCreateRequest.java
package com.fidanlik.fidanysserver.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderCreateRequest {
    private String customerId;
    private String warehouseId;
    private String deliveryAddress;
    private List<OrderItemDto> items;
}