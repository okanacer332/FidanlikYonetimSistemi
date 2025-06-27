package com.fidanlik.fidanysserver.accounting.controller;

import com.fidanlik.fidanysserver.accounting.dto.InflationRateRequest;
import com.fidanlik.fidanysserver.accounting.model.InflationRate;
import com.fidanlik.fidanysserver.accounting.service.InflationRateService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inflation-rates")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')") // Bu endpoint'lere sadece Admin erişebilir
public class InflationRateController {

    private final InflationRateService inflationRateService;

    @PostMapping
    public ResponseEntity<InflationRate> createInflationRate(@RequestBody InflationRateRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate createdRate = inflationRateService.createInflationRate(request, authenticatedUser.getTenantId());
        return new ResponseEntity<>(createdRate, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InflationRate>> getAllInflationRates(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<InflationRate> rates = inflationRateService.getAllInflationRates(authenticatedUser.getTenantId());
        return ResponseEntity.ok(rates);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InflationRate> updateInflationRate(
            @PathVariable String id,
            @RequestBody InflationRateRequest request,
            Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate updatedRate = inflationRateService.updateInflationRate(id, request, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedRate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInflationRate(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        inflationRateService.deleteInflationRate(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}