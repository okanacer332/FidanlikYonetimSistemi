package com.fidanlik.fidanysserver.reporting.controller;

import com.fidanlik.fidanysserver.reporting.dto.CustomerSalesReport;
import com.fidanlik.fidanysserver.reporting.dto.TopSellingPlantReport;
import com.fidanlik.fidanysserver.reporting.service.ReportingService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/top-selling-plants")
    public ResponseEntity<List<TopSellingPlantReport>> getTopSellingPlants(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportingService.getTopSellingPlants(user.getTenantId()));
    }

    @GetMapping("/customer-sales")
    public ResponseEntity<List<CustomerSalesReport>> getCustomerSales(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportingService.getCustomerSales(user.getTenantId()));
    }
}
