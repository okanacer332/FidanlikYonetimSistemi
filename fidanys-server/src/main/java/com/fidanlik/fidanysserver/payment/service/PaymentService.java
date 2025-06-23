package com.fidanlik.fidanysserver.payment.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.payment.dto.PaymentRequest;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionService transactionService;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Payment createCollection(PaymentRequest request, String userId, String tenantId) {
        // Müşteri var mı ve bu tenant'a mı ait kontrol et
        customerRepository.findById(request.getCustomerId())
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Müşteri bulunamadı."));

        Payment payment = new Payment();
        payment.setTenantId(tenantId);
        payment.setUserId(userId);
        payment.setType(Payment.PaymentType.COLLECTION);
        payment.setMethod(request.getMethod());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setDescription(request.getDescription());
        payment.setRelatedId(request.getCustomerId());
        payment.setRelatedEntityType(Payment.RelatedEntityType.CUSTOMER);
        payment.setInvoiceId(request.getInvoiceId());

        Payment savedPayment = paymentRepository.save(payment);

        // Cari hesaba alacak kaydı at
        transactionService.createCustomerTransaction(
                request.getCustomerId(),
                Transaction.TransactionType.CREDIT, // Müşterinin borcundan düşülecek
                request.getAmount(),
                "Tahsilat - " + request.getDescription(),
                savedPayment.getId(),
                userId,
                tenantId
        );

        // Eğer bir faturaya bağlıysa, faturanın durumunu güncelle
        if (request.getInvoiceId() != null && !request.getInvoiceId().isEmpty()) {
            invoiceRepository.findById(request.getInvoiceId()).ifPresent(invoice -> {
                // TODO: Faturanın kalan tutarını hesaplayıp, tam ödendiyse durumunu 'PAID' yap.
                // Şimdilik basitçe durumu güncelliyoruz.
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
                invoiceRepository.save(invoice);
            });
        }

        return savedPayment;
    }

    public List<Payment> getAllPayments(String tenantId) {
        return paymentRepository.findAllByTenantIdOrderByPaymentDateDesc(tenantId);
    }
}