package com.fidanlik.fidanysserver.order.controller;

import com.fidanlik.fidanysserver.order.dto.OrderCreateRequest;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.service.OrderService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Yeni bir sipariş oluşturur.
     * Sadece ADMIN ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param request Sipariş oluşturma isteği.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan sipariş nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request, @AuthenticationPrincipal User authenticatedUser) {
        Order createdOrder = orderService.createOrder(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    /**
     * Bir tenant'a ait tüm siparişleri listeler.
     * İlgili tüm roller (ADMIN, SALES, ACCOUNTANT, WAREHOUSE_STAFF) erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Sipariş listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_ACCOUNTANT', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<Order>> getAllOrders(@AuthenticationPrincipal User authenticatedUser) {
        List<Order> orders = orderService.getAllOrdersByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(orders);
    }

    /**
     * Bir siparişin durumunu "sevk edildi" olarak günceller.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param id Sipariş ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Güncellenmiş sipariş nesnesi.
     */
    @PostMapping("/{id}/ship")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Order> shipOrder(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Order updatedOrder = orderService.shipOrder(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Bir siparişin durumunu "teslim edildi" olarak günceller.
     * ADMIN, SALES ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param id Sipariş ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Güncellenmiş sipariş nesnesi.
     */
    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Order> deliverOrder(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Order updatedOrder = orderService.deliverOrder(id, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Bir siparişi iptal eder.
     * Sadece ADMIN ve SALES rollerine sahip kullanıcılar erişebilir.
     * @param id Sipariş ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Güncellenmiş (iptal edilmiş) sipariş nesnesi.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public ResponseEntity<Order> cancelOrder(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        Order updatedOrder = orderService.cancelOrder(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedOrder);
    }
}