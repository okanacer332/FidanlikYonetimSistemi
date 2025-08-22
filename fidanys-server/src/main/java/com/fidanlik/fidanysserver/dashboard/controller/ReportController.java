package com.fidanlik.fidanysserver.dashboard.controller;

import com.fidanlik.fidanysserver.dashboard.dto.CostAnalysisReportDTO;
import com.fidanlik.fidanysserver.dashboard.dto.InflationOverviewDTO;
import com.fidanlik.fidanysserver.dashboard.service.ReportService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fidanlik.fidanysserver.dashboard.dto.PricePerformanceReportDTO;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inflation-overview")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<InflationOverviewDTO> getInflationOverviewReport(@AuthenticationPrincipal User currentUser) {
        InflationOverviewDTO overviewData = reportService.getInflationOverview(currentUser.getTenantId());
        return ResponseEntity.ok(overviewData);
    }

    // YENİ ENDPOINT
    @GetMapping("/cost-analysis")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<CostAnalysisReportDTO> getCostAnalysisReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam("productionBatchId") Optional<String> productionBatchId,
            @AuthenticationPrincipal User currentUser) {

        CostAnalysisReportDTO reportData = reportService.getCostAnalysisReport(startDate, endDate, currentUser.getTenantId(), productionBatchId);
        return ResponseEntity.ok(reportData);
    }

    @GetMapping("/price-performance")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<PricePerformanceReportDTO> getPricePerformanceReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam("plantId") String plantId,
            @AuthenticationPrincipal User currentUser) {

        PricePerformanceReportDTO reportData = reportService.getPricePerformanceReport(startDate, endDate, plantId, currentUser.getTenantId());
        return ResponseEntity.ok(reportData);
    }
}