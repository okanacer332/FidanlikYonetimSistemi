package com.fidanlik.fidanysserver.invoicing.controller;

import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.service.InvoiceService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Perfect class-level security
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Belirli bir siparişten fatura oluşturur.
     * @param orderId Sipariş ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan fatura nesnesi.
     */
    @PostMapping("/from-order/{orderId}")
    public ResponseEntity<Invoice> createInvoiceFromOrder(@PathVariable String orderId, @AuthenticationPrincipal User authenticatedUser) {
        Invoice invoice = invoiceService.createInvoiceFromOrder(orderId, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }

    /**
     * Bir tenant'a ait tüm faturaları listeler.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Fatura listesi.
     */
    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices(@AuthenticationPrincipal User authenticatedUser) {
        List<Invoice> invoices = invoiceService.getAllInvoices(authenticatedUser.getTenantId());
        return ResponseEntity.ok(invoices);
    }

    /**
     * ID'ye göre tek bir faturayı getirir.
     * @param invoiceId Fatura ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Bulunan fatura veya 404 Not Found.
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable String invoiceId, @AuthenticationPrincipal User authenticatedUser) {
        return invoiceService.getInvoiceById(invoiceId, authenticatedUser.getTenantId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}