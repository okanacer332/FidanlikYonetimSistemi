package com.fidanlik.fidanysserver.order.repository;

import com.fidanlik.fidanysserver.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List; // Import List

public interface OrderRepository extends MongoRepository<Order, String> {
    // ADD THIS LINE
    List<Order> findAllByTenantId(String tenantId);
}