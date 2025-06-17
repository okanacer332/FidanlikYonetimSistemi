// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/model/Order.java
package com.fidanlik.fidanysserver.order.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String orderNumber;
    private String customerId;
    private String warehouseId;
    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime orderDate;
    private String userId;
    private String tenantId;

    public enum OrderStatus {
        PREPARING, SHIPPED, DELIVERED, CANCELED
    }

    @Data
    public static class OrderItem {
        private String plantId;
        private int quantity;
        private BigDecimal salePrice; // Satış anındaki birim fiyat
    }
}