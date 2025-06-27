package com.fidanlik.fidanysserver.order.repository;

import com.fidanlik.fidanysserver.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime; // YENİ IMPORT
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByTenantId(String tenantId);
    long countByTenantId(String tenantId);

    // --- YENİ EKLENEN METOT ---
    List<Order> findAllByTenantIdAndStatusAndOrderDateBetween(
            String tenantId,
            Order.OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}