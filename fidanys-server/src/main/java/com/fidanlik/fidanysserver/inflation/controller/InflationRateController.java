package com.fidanlik.fidanysserver.inflation.controller;

import com.fidanlik.fidanysserver.inflation.model.InflationRate;
import com.fidanlik.fidanysserver.inflation.service.InflationRateService;
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
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ACCOUNTANT')") // Sadece ADMIN ve MUHASEBECİ rolleri erişebilir
public class InflationRateController {

    private final InflationRateService inflationRateService;

    @PostMapping
    public ResponseEntity<InflationRate> createInflationRate(@RequestBody InflationRate inflationRate, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate savedRate = inflationRateService.createInflationRate(inflationRate, authenticatedUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRate);
    }

    @GetMapping
    public ResponseEntity<List<InflationRate>> getAllInflationRates(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<InflationRate> rates = inflationRateService.getAllInflationRatesByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(rates);
    }

    @GetMapping("/{year}/{month}")
    public ResponseEntity<InflationRate> getInflationRateByYearAndMonth(@PathVariable int year, @PathVariable int month, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate rate = inflationRateService.getInflationRateByYearAndMonth(year, month, authenticatedUser.getTenantId());
        return ResponseEntity.ok(rate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InflationRate> updateInflationRate(@PathVariable String id, @RequestBody InflationRate inflationRate, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        InflationRate updatedRate = inflationRateService.updateInflationRate(id, inflationRate, authenticatedUser.getTenantId());
        return ResponseEntity.ok(updatedRate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInflationRate(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        inflationRateService.deleteInflationRate(id, authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}