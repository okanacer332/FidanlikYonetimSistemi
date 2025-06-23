package com.fidanlik.fidanysserver.invoicing.controller;

import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.service.InvoiceService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/from-order/{orderId}")
    public ResponseEntity<Invoice> createInvoiceFromOrder(@PathVariable String orderId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Invoice invoice = invoiceService.createInvoiceFromOrder(orderId, user.getId(), user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Invoice> invoices = invoiceService.getAllInvoices(user.getTenantId());
        return ResponseEntity.ok(invoices);
    }
}