package com.fidanlik.fidanysserver.order.service;

import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.order.dto.OrderCreateRequest;
import com.fidanlik.fidanysserver.order.dto.OrderItemDto;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // Bu metot doğru, dokunmuyoruz.
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public Order createOrder(OrderCreateRequest request, String userId, String tenantId) {
        // ... (mevcut createOrder kodu burada kalacak)
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

        return orderRepository.save(order);
    }

    // --- YENİ GÜVENLİ METOTLAR ---

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public Order shipOrder(String orderId, String userId, String tenantId) {
        Order order = findOrderForUpdate(orderId, tenantId);
        if (order.getStatus() != Order.OrderStatus.PREPARING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sadece 'Hazırlanıyor' durumundaki siparişler sevk edilebilir.");
        }

        // Stok düşme işlemi
        for (Order.OrderItem item : order.getItems()) {
            stockService.changeStock(
                    item.getPlantId(), order.getWarehouseId(), -item.getQuantity(),
                    StockMovement.MovementType.SALE, order.getId(),
                    "Sipariş Sevkiyatı - No: " + order.getOrderNumber(), userId, tenantId
            );
        }

        order.setStatus(Order.OrderStatus.SHIPPED);
        return orderRepository.save(order);
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public Order deliverOrder(String orderId, String tenantId) {
        Order order = findOrderForUpdate(orderId, tenantId);
        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sadece 'Sevk Edildi' durumundaki siparişler teslim edilebilir.");
        }
        order.setStatus(Order.OrderStatus.DELIVERED);
        return orderRepository.save(order);
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SALES')")
    public Order cancelOrder(String orderId, String userId, String tenantId) {
        Order order = findOrderForUpdate(orderId, tenantId);

        // Eğer sipariş sevk edildiyse, stokları iade et.
        if (order.getStatus() == Order.OrderStatus.SHIPPED) {
            for (Order.OrderItem item : order.getItems()) {
                stockService.changeStock(
                        item.getPlantId(), order.getWarehouseId(), item.getQuantity(), // Pozitif miktar ile stoğa iade
                        StockMovement.MovementType.SALE_CANCEL, order.getId(),
                        "İptal Edilen Sevkiyat İadesi - Sipariş No: " + order.getOrderNumber(), userId, tenantId
                );
            }
        }

        order.setStatus(Order.OrderStatus.CANCELED);
        return orderRepository.save(order);
    }

    // --- YARDIMCI METOT ---

    private Order findOrderForUpdate(String orderId, String tenantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı."));

        if (!order.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu siparişe erişim yetkiniz yok.");
        }

        if (order.getStatus() == Order.OrderStatus.DELIVERED || order.getStatus() == Order.OrderStatus.CANCELED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamamlanmış veya iptal edilmiş bir siparişin durumu değiştirilemez.");
        }

        return order;
    }

    public List<Order> getAllOrdersByTenant(String tenantId) {
        return orderRepository.findAllByTenantId(tenantId);
    }
}