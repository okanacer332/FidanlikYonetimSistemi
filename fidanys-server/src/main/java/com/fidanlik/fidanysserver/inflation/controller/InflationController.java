package com.fidanlik.fidanysserver.inflation.controller;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.service.InflationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Bu importun olduğundan emin olun
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inflation")
@RequiredArgsConstructor
public class InflationController {

    private final InflationService inflationService;

    @PostMapping("/fetch")
    // DÜZELTME: "hasAuthority('ADMIN')" yerine "hasRole('ADMIN')" kullanıyoruz.
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> fetchAndSaveData(
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {
        try {
            inflationService.fetchAndSaveInflationData(startDate, endDate);
            return ResponseEntity.ok("Enflasyon verileri başarıyla çekildi ve güncellendi.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Veri çekme işlemi sırasında bir hata oluştu: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InflationData>> getAllData() {
        List<InflationData> data = inflationService.getAllInflationData();
        return ResponseEntity.ok(data);
    }
}