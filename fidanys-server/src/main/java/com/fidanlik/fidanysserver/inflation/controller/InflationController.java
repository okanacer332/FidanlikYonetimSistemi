package com.fidanlik.fidanysserver.inflation.controller;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.service.InflationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inflation")
@RequiredArgsConstructor
public class InflationController {

    private final InflationService inflationService;

    /**
     * Aktif kullanıcıya ait, sisteme kayıtlı tüm enflasyon verilerini listeler.
     * @return HTTP 200 (OK) ve enflasyon verileri listesi.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('settings:read')") // Örnek bir yetkilendirme
    public ResponseEntity<List<InflationData>> getAllInflationData() {
        List<InflationData> data = inflationService.getInflationDataForCurrentTenant();
        return ResponseEntity.ok(data);
    }

    /**
     * TCMB API'sinden enflasyon verilerini çekme işlemini tetikler.
     * @return HTTP 200 (OK) ve boş bir yanıt.
     */
    @PostMapping("/fetch")
    @PreAuthorize("hasAuthority('settings:write')") // Örnek bir yetkilendirme
    public ResponseEntity<Void> fetchInflationData() {
        inflationService.fetchAndSaveInflationData();
        return ResponseEntity.ok().build();
    }
}