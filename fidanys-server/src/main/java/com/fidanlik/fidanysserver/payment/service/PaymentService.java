package com.fidanlik.fidanysserver.payment.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.customer.repository.CustomerRepository;
import com.fidanlik.fidanysserver.expense.model.Expense;
import com.fidanlik.fidanysserver.invoicing.model.Invoice;
import com.fidanlik.fidanysserver.invoicing.repository.InvoiceRepository;
import com.fidanlik.fidanysserver.payment.dto.PaymentRequest;
import com.fidanlik.fidanysserver.payment.model.Payment;
import com.fidanlik.fidanysserver.payment.repository.PaymentRepository;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository; // BU SATIR ZATEN VARDI
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
    private final SupplierRepository supplierRepository; // DÜZELTME: Bu satırın burada olması gerekiyor.

    @Transactional
    public Payment createCollection(PaymentRequest request, String userId, String tenantId) {
        // ... (Mevcut createCollection metodu aynı kalacak)
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

        transactionService.createCustomerTransaction(
                request.getCustomerId(),
                Transaction.TransactionType.CREDIT,
                request.getAmount(),
                "Tahsilat - " + request.getDescription(),
                savedPayment.getId(),
                userId,
                tenantId
        );

        if (request.getInvoiceId() != null && !request.getInvoiceId().isEmpty()) {
            invoiceRepository.findById(request.getInvoiceId()).ifPresent(invoice -> {
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
                invoiceRepository.save(invoice);
            });
        }

        return savedPayment;
    }

    @Transactional
    public Payment createPaymentToSupplier(PaymentRequest request, String userId, String tenantId) {
        supplierRepository.findById(request.getSupplierId())
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tedarikçi bulunamadı."));

        Payment payment = new Payment();
        payment.setTenantId(tenantId);
        payment.setUserId(userId);
        payment.setType(Payment.PaymentType.PAYMENT);
        payment.setMethod(request.getMethod());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setDescription(request.getDescription());
        payment.setRelatedId(request.getSupplierId());
        payment.setRelatedEntityType(Payment.RelatedEntityType.SUPPLIER);

        Payment savedPayment = paymentRepository.save(payment);

        transactionService.createSupplierTransaction(
                request.getSupplierId(),
                Transaction.TransactionType.DEBIT,
                request.getAmount(),
                "Tediye - " + request.getDescription(),
                savedPayment.getId(),
                userId,
                tenantId
        );

        return savedPayment;
    }

    @Transactional
    public Payment createPaymentForExpense(Expense expense, Payment.PaymentMethod method, String userId, String tenantId) {
        // ... (Mevcut createPaymentForExpense metodu aynı kalacak)
        Payment payment = new Payment();
        payment.setTenantId(tenantId);
        payment.setUserId(userId);
        payment.setType(Payment.PaymentType.PAYMENT); // Tediye (Para Çıkışı)
        payment.setMethod(method);
        payment.setPaymentDate(expense.getExpenseDate());
        payment.setAmount(expense.getAmount());
        payment.setDescription("Gider - " + expense.getDescription());
        payment.setRelatedId(expense.getId());
        payment.setRelatedEntityType(Payment.RelatedEntityType.EXPENSE);

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments(String tenantId) {
        return paymentRepository.findAllByTenantIdOrderByPaymentDateDesc(tenantId);
    }
}