package com.fidanlik.fidanysserver.payment.controller;

import com.fidanlik.fidanysserver.payment.dto.PaymentRequest;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/collection")
    public ResponseEntity<Payment> createCollection(@RequestBody PaymentRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Payment payment = paymentService.createCollection(request, user.getId(), user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @PostMapping("/payment-to-supplier")
    public ResponseEntity<Payment> createPaymentToSupplier(@RequestBody PaymentRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        // DİKKAT: Request DTO'sunda supplierId bekliyoruz.
        Payment payment = paymentService.createPaymentToSupplier(request, user.getId(), user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(paymentService.getAllPayments(user.getTenantId()));
    }
}