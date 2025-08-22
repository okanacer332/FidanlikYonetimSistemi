package com.fidanlik.fidanysserver.order.repository;

import com.fidanlik.fidanysserver.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByTenantId(String tenantId);

    // YENİ EKLENDİ: Anasayfa raporu için gerekli metot.
    long countByTenantId(String tenantId);
    long countByTenantIdAndStatusAndExpectedDeliveryDate(String tenantId, Order.OrderStatus status, LocalDate date);
    // Bu metotları ekleyin (eğer zaten yoksa)
    List<Order> findByTenantIdAndStatusInAndOrderDateAfter(String tenantId, List<Order.OrderStatus> statuses, LocalDateTime date);
    long countByTenantIdAndStatus(String tenantId, Order.OrderStatus status);
    List<Order> findByTenantIdAndStatusInAndOrderDateBetween(String tenantId, List<Order.OrderStatus> statuses, LocalDateTime startDate, LocalDateTime endDate);
    List<Order> findByTenantIdAndStatusIn(String tenantId, List<Order.OrderStatus> statuses);

    List<Order> findAllByTenantIdAndStatusInAndOrderDateBetween(String tenantId, List<Order.OrderStatus> statuses, LocalDateTime startDate, LocalDateTime endDate);

    List<Order> findAllByTenantIdAndStatusInAndOrderDateBetweenAndItems_PlantId(
            String tenantId,
            List<Order.OrderStatus> statuses,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String plantId
    );
}
