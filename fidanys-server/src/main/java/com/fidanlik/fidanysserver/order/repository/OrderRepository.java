// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/repository/OrderRepository.java
package com.fidanlik.fidanysserver.order.repository;

import com.fidanlik.fidanysserver.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {}