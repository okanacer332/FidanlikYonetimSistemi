package com.fidanlik.fidanysserver.payment.repository;

import com.fidanlik.fidanysserver.payment.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findAllByTenantIdOrderByPaymentDateDesc(String tenantId);
    List<Payment> findByTenantIdAndPaymentDateAfter(String tenantId, LocalDate date);
}