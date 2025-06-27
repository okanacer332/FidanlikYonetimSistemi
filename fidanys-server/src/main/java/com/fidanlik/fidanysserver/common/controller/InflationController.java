package com.fidanlik.fidanysserver.common.controller;

import com.fidanlik.fidanysserver.common.dto.InflationRateRequest;
import com.fidanlik.fidanysserver.common.model.InflationRate;
import com.fidanlik.fidanysserver.common.service.InflationService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // DÜZELTME: javax.validation.Valid yerine jakarta.validation.Valid
import java.util.List;

@RestController
@RequestMapping("/api/v1/inflation-rates")
@RequiredArgsConstructor
public class InflationController {

    private final InflationService inflationService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<InflationRate> createInflationRate(@Valid @RequestBody InflationRateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate savedRate = inflationService.createInflationRate(request, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRate);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT', 'ROLE_SALES', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<List<InflationRate>> getAllInflationRates(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<InflationRate> rates = inflationService.getAllInflationRatesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(rates);
    }

    // Gelecekte güncelleme veya silme endpoint'leri de eklenebilir
}