package com.fidanlik.fidanysserver.accounting.controller;

import com.fidanlik.fidanysserver.accounting.dto.RealProfitLossReportDTO;
import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.FinancialReportService;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Varsayılan olarak tüm modül finans ekibine ait
public class AccountingController {

    private final TransactionService transactionService;
    private final FinancialReportService financialReportService;

    /**
     * Bir müşterinin hesap hareketlerini (bakiye raporu) listeler.
     * Satışçıların da kendi müşterilerinin durumunu görmesi gerektiği için onlara da yetki verilir.
     * @param customerId Müşteri ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Hesap hareketleri listesi.
     */
    @GetMapping("/customers/{customerId}/transactions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT', 'ROLE_SALES')")
    public ResponseEntity<List<Transaction>> getCustomerTransactions(@PathVariable String customerId, @AuthenticationPrincipal User authenticatedUser) {
        List<Transaction> transactions = transactionService.getCustomerTransactions(customerId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(transactions);
    }

    /**
     * Bir tedarikçinin hesap hareketlerini listeler.
     * @param supplierId Tedarikçi ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Hesap hareketleri listesi.
     */
    @GetMapping("/suppliers/{supplierId}/transactions")
    public ResponseEntity<List<Transaction>> getSupplierTransactions(@PathVariable String supplierId, @AuthenticationPrincipal User authenticatedUser) {
        List<Transaction> transactions = transactionService.getSupplierTransactions(supplierId, authenticatedUser.getTenantId());
        return ResponseEntity.ok(transactions);
    }

    /**
     * Enflasyona göre düzeltilmiş reel kâr/zarar raporu oluşturur.
     * @param startDate Rapor başlangıç tarihi.
     * @param endDate Rapor bitiş tarihi.
     * @param baseDate Enflasyon bazı tarihi.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Reel kâr/zarar raporu.
     */
    @GetMapping("/reports/profit-loss/real")
    public ResponseEntity<RealProfitLossReportDTO> getRealProfitLossReport(
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate,
            @RequestParam("baseDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate baseDate,
            @AuthenticationPrincipal User authenticatedUser) {
        String tenantId = authenticatedUser.getTenantId();
        RealProfitLossReportDTO report = financialReportService.generateRealProfitLossReport(startDate, endDate, baseDate, tenantId);
        return ResponseEntity.ok(report);
    }
}