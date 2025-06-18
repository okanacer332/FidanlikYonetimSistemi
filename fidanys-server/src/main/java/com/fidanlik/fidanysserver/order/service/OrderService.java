// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/order/service/OrderService.java
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
    private final PlantRepository plantRepository; // PlantRepository'yi kullanmak için ekledik

    @Transactional
    public Order createOrder(OrderCreateRequest request, String userId, String tenantId) {
        // Gerekli ID'lerin varlığını ve tenant'a ait olduğunu kontrol et
        customerRepository.findById(request.getCustomerId())
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz müşteri ID'si."));

        warehouseRepository.findById(request.getWarehouseId())
                .filter(w -> w.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));

        // Sipariş kalemlerini ve toplam tutarı hesapla
        List<Order.OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDto itemDto : request.getItems()) {
            // Fidanın varlığını kontrol et
            plantRepository.findById(itemDto.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + itemDto.getPlantId()));

            BigDecimal price = itemDto.getSalePrice() != null ? itemDto.getSalePrice() : BigDecimal.ZERO; // Fiyatı DTO'dan al

            Order.OrderItem orderItem = new Order.OrderItem();
            orderItem.setPlantId(itemDto.getPlantId());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSalePrice(price);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(price.multiply(new BigDecimal(itemDto.getQuantity())));
        }

        Order order = new Order();
        order.setOrderNumber("SIP-" + System.currentTimeMillis()); // Basit bir sipariş no üretimi
        order.setCustomerId(request.getCustomerId());
        order.setWarehouseId(request.getWarehouseId());
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setStatus(Order.OrderStatus.PREPARING); // Sipariş başlangıçta HAZIRLANIYOR durumunda
        order.setOrderDate(LocalDateTime.now());
        order.setUserId(userId);
        order.setTenantId(tenantId);
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate()); // Yeni eklendi

        Order savedOrder = orderRepository.save(order);

        // Stoktan düşme işlemleri burada YAPILMIYOR.
        // Stok düşüşü, sipariş "SHIPPED" (Sevkedildi) durumuna geçtiğinde tetiklenecek.

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(String orderId, Order.OrderStatus newStatus, String userId, String tenantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı."));

        if (!order.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin siparişini güncellemeye yetkiniz yok.");
        }

        // Durum geçişi kontrolleri burada yapılabilir (örn: CANCELED'dan SHIPPED olamaz)
        // Eğer sipariş zaten aynı durumdaysa işlem yapma
        if (order.getStatus() == newStatus) {
            return order;
        }

        // Stoktan düşme işlemini sadece sipariş SEVKEDİLDİ durumuna geçtiğinde yap
        if (newStatus == Order.OrderStatus.SHIPPED && order.getStatus() != Order.OrderStatus.SHIPPED) {
            for (Order.OrderItem item : order.getItems()) {
                stockService.changeStock(
                        item.getPlantId(),
                        order.getWarehouseId(),
                        -item.getQuantity(), // Negatif miktar ile stoktan düş
                        StockMovement.MovementType.SALE,
                        order.getId(),
                        "Sipariş Sevkiyatı - Sipariş No: " + order.getOrderNumber(),
                        userId,
                        tenantId
                );
            }
        }
        // İptal durumunda stok iadesi (eğer daha önce düşüldüyse)
        else if (newStatus == Order.OrderStatus.CANCELED && (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED)) {
            // Eğer sipariş zaten sevkedilmiş/teslim edilmişse ve iptal ediliyorsa stok iadesi yap
            for (Order.OrderItem item : order.getItems()) {
                stockService.changeStock(
                        item.getPlantId(),
                        order.getWarehouseId(),
                        item.getQuantity(), // Pozitif miktar ile stok iadesi yap
                        StockMovement.MovementType.RETURN, // Yeni MovementType ekleyebilirsiniz veya GOODS_RECEIPT kullanabilirsiniz
                        order.getId(),
                        "Sipariş İptali - Stok İadesi - Sipariş No: " + order.getOrderNumber(),
                        userId,
                        tenantId
                );
            }
        }


        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // Diğer Order servis metotları buraya eklenebilir (getAllOrdersByTenant, getOrderById vb.)
}