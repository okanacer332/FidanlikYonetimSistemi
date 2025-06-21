package com.fidanlik.fidanysserver.order.service;

import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.order.dto.OrderCreateRequest;
import com.fidanlik.fidanysserver.order.dto.OrderItemDto;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockService stockService;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final PlantRepository plantRepository;

    @Transactional
    public Order createOrder(OrderCreateRequest request, String userId, String tenantId) {
        customerRepository.findById(request.getCustomerId())
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz müşteri ID'si."));

        warehouseRepository.findById(request.getWarehouseId())
                .filter(w -> w.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));

        List<Order.OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDto itemDto : request.getItems()) {
            plantRepository.findById(itemDto.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + itemDto.getPlantId()));

            BigDecimal price = itemDto.getSalePrice() != null ? itemDto.getSalePrice() : BigDecimal.ZERO;

            Order.OrderItem orderItem = new Order.OrderItem();
            orderItem.setPlantId(itemDto.getPlantId());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSalePrice(price);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(price.multiply(new BigDecimal(itemDto.getQuantity())));
        }

        Order order = new Order();
        order.setOrderNumber("SIP-" + System.currentTimeMillis());
        order.setCustomerId(request.getCustomerId());
        order.setWarehouseId(request.getWarehouseId());
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setStatus(Order.OrderStatus.PREPARING);
        order.setOrderDate(LocalDateTime.now());
        order.setUserId(userId);
        order.setTenantId(tenantId);
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());

        Order savedOrder = orderRepository.save(order);

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(String orderId, Order.OrderStatus newStatus, String userId, String tenantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı."));

        if (!order.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin siparişini güncellemeye yetkiniz yok.");
        }

        if (order.getStatus() == newStatus) {
            return order;
        }

        if (newStatus == Order.OrderStatus.SHIPPED && order.getStatus() == Order.OrderStatus.PREPARING) {
            for (Order.OrderItem item : order.getItems()) {
                stockService.changeStock(
                        item.getPlantId(),
                        order.getWarehouseId(),
                        -item.getQuantity(),
                        StockMovement.MovementType.SALE,
                        order.getId(),
                        "Sipariş Sevkiyatı - Sipariş No: " + order.getOrderNumber(),
                        userId,
                        tenantId
                );
            }
        }
        else if (newStatus == Order.OrderStatus.CANCELED && order.getStatus() == Order.OrderStatus.PREPARING) {
            // No stock movement needed if canceled from PREPARING
        }
        else if (newStatus == Order.OrderStatus.DELIVERED && order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sipariş sevk edilmeden teslim edilemez.");
        }
        else if (order.getStatus() == Order.OrderStatus.CANCELED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "İptal edilmiş veya teslim edilmiş siparişin durumu değiştirilemez.");
        }


        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // NEW METHOD to get all orders
    public List<Order> getAllOrdersByTenant(String tenantId) {
        return orderRepository.findAllByTenantId(tenantId);
    }
}