// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/controller/OrderController.java
package com.fidanlik.fidanysserver.order.controller;

import com.fidanlik.fidanysserver.order.dto.OrderCreateRequest;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.service.OrderService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELI')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order createdOrder = orderService.createOrder(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }
}