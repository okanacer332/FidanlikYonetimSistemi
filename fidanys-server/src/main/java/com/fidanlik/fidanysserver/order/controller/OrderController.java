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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order createdOrder = orderService.createOrder(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<Order> orders = orderService.getAllOrdersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(orders);
    }

    // --- YENİ ENDPOINTLER ---

    @PostMapping("/{id}/ship")
    public ResponseEntity<Order> shipOrder(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order updatedOrder = orderService.shipOrder(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<Order> deliverOrder(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order updatedOrder = orderService.deliverOrder(id, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order updatedOrder = orderService.cancelOrder(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }
}