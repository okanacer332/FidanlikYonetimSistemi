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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping; // ADD THIS
import java.util.List; // ADD THIS

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order createdOrder = orderService.createOrder(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @PutMapping("/{id}/status/{newStatus}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id, @PathVariable Order.OrderStatus newStatus, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order updatedOrder = orderService.updateOrderStatus(id, newStatus, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }

    // NEW ENDPOINT
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Order>> getAllOrders(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Order> orders = orderService.getAllOrdersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(orders);
    }
}