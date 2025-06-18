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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    // DÜZELTİLDİ: 'ROLE_SATIŞ PERSONELI' -> 'ROLE_SATIŞ PERSONELİ' olarak değiştirildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order createdOrder = orderService.createOrder(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @PutMapping("/{id}/status/{newStatus}")
    // DÜZELTİLDİ: 'ROLE_SATIŞ PERSONELI' -> 'ROLE_SATIŞ PERSONELİ' olarak değiştirildi.
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_DEPO SORUMLUSU', 'ROLE_SATIŞ PERSONELİ')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id, @PathVariable Order.OrderStatus newStatus, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        Order updatedOrder = orderService.updateOrderStatus(id, newStatus, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }
}