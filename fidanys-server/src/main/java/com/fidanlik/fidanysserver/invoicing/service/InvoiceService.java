package com.fidanlik.fidanysserver.invoicing.service;

import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.model.InvoiceItem;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.order.model.Order;
import com.fidanlik.fidanysserver.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final PlantRepository plantRepository; // Fidan adını almak için

    @Transactional
    public Invoice createInvoiceFromOrder(String orderId, String userId, String tenantId) {
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sipariş bulunamadı."));

        if (invoiceRepository.existsByOrderId(orderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu sipariş için zaten bir fatura oluşturulmuş.");
        }

        List<InvoiceItem> invoiceItems = order.getItems().stream().map(orderItem -> {
            InvoiceItem item = new InvoiceItem();
            item.setPlantId(orderItem.getPlantId());
            // Fidan adını alıp açıklamaya ekleyelim
            plantRepository.findById(orderItem.getPlantId()).ifPresent(plant ->
                    item.setDescription(plant.getPlantType().getName() + " - " + plant.getPlantVariety().getName())
            );
            item.setQuantity(orderItem.getQuantity());
            item.setUnitPrice(orderItem.getSalePrice());
            item.setTotalPrice(orderItem.getSalePrice().multiply(new BigDecimal(orderItem.getQuantity())));
            return item;
        }).collect(Collectors.toList());

        Invoice invoice = new Invoice();
        invoice.setTenantId(tenantId);
        invoice.setUserId(userId);
        invoice.setOrderId(order.getId());
        invoice.setCustomerId(order.getCustomerId());
        // TODO: Daha gelişmiş bir fatura numarası üretme mekanizması eklenebilir.
        invoice.setInvoiceNumber("FAT-" + order.getOrderNumber());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30)); // Örn: 30 gün vade
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        invoice.setItems(invoiceItems);

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices(String tenantId) {
        return invoiceRepository.findAllByTenantId(tenantId);
    }
}