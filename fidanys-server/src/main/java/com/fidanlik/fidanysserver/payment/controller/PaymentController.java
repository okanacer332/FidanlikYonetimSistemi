package com.fidanlik.fidanysserver.payment.controller;

import com.fidanlik.fidanysserver.payment.dto.PaymentRequest;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.service.PaymentService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Excellent class-level security
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Müşteriden gelen bir tahsilatı (ödeme) kaydeder.
     * @param request Tahsilat bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan ödeme nesnesi.
     */
    @PostMapping("/collection")
    public ResponseEntity<Payment> createCollection(@RequestBody PaymentRequest request, @AuthenticationPrincipal User authenticatedUser) {
        Payment payment = paymentService.createCollection(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    /**
     * Bir tedarikçiye yapılan ödemeyi kaydeder.
     * @param request Tedarikçi ödeme bilgileri.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan ödeme nesnesi.
     */
    @PostMapping("/payment-to-supplier")
    public ResponseEntity<Payment> createPaymentToSupplier(@RequestBody PaymentRequest request, @AuthenticationPrincipal User authenticatedUser) {
        Payment payment = paymentService.createPaymentToSupplier(request, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    /**
     * Bir tenant'a ait tüm ödemeleri (tahsilat ve tedarikçi) listeler.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Ödeme listesi.
     */
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments(@AuthenticationPrincipal User authenticatedUser) {
        return ResponseEntity.ok(paymentService.getAllPayments(authenticatedUser.getTenantId()));
    }
}