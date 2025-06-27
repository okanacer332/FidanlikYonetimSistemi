package com.fidanlik.fidanysserver.reporting.controller;

import com.fidanlik.fidanysserver.reporting.dto.*; // DTO'ları tek seferde almak için güncellendi
import com.fidanlik.fidanysserver.reporting.service.ReportingService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT', 'ROLE_SALES')")
public class ReportingController {

    private final ReportingService reportingService;

    // --- MEVCUT ENDPOINT'LER (Aynen kaldı) ---

    @GetMapping("/dashboard-overview")
    public ResponseEntity<OverviewReportDto> getDashboardOverview(
            Authentication authentication,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        User user = (User) authentication.getPrincipal();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return ResponseEntity.ok(reportingService.getDashboardOverview(user.getTenantId(), startDate, endDate));
    }

    @GetMapping("/top-selling-plants")
    public ResponseEntity<List<TopSellingPlantReport>> getTopSellingPlants(
            Authentication authentication,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        User user = (User) authentication.getPrincipal();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return ResponseEntity.ok(reportingService.getTopSellingPlants(user.getTenantId(), startDate, endDate));
    }

    @GetMapping("/customer-sales")
    public ResponseEntity<List<CustomerSalesReport>> getCustomerSales(
            Authentication authentication,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        User user = (User) authentication.getPrincipal();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return ResponseEntity.ok(reportingService.getCustomerSales(user.getTenantId(), startDate, endDate));
    }

    @GetMapping("/profitability")
    public ResponseEntity<List<ProfitabilityReportDto>> getProfitabilityReport(
            Authentication authentication,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        User user = (User) authentication.getPrincipal();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return ResponseEntity.ok(reportingService.getProfitabilityReport(user.getTenantId(), startDate, endDate));
    }

    @GetMapping("/overview")
    public ResponseEntity<OverviewReportDto> getOverviewReport(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportingService.getOverviewReport(user.getTenantId()));
    }


    // --- VİZYONUMUZUN NİHAİ ÇIKTISI: YENİ REEL KÂRLILIK ENDPOINT'İ ---
    @GetMapping("/real-profitability")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // Bu özel raporu sadece Admin görebilsin
    public ResponseEntity<List<RealProfitabilityReportDto>> getRealProfitabilityReport(
            Authentication authentication,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        User user = (User) authentication.getPrincipal();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        List<RealProfitabilityReportDto> report = reportingService.getRealProfitabilityReport(user.getTenantId(), startDate, endDate);
        return ResponseEntity.ok(report);
    }
}