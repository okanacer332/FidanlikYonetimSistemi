package com.fidanlik.fidanysserver.order.repository;

import com.fidanlik.fidanysserver.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByTenantId(String tenantId);

    // YENİ EKLENDİ: Anasayfa raporu için gerekli metot.
    long countByTenantId(String tenantId);
}
