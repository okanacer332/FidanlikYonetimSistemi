package com.fidanlik.fidanysserver.accounting.service;

import com.fidanlik.fidanysserver.accounting.dto.InflationRateRequest;
import com.fidanlik.fidanysserver.accounting.model.InflationRate;
import com.fidanlik.fidanysserver.accounting.repository.InflationRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InflationRateService {

    private final InflationRateRepository inflationRateRepository;

    public InflationRate createInflationRate(InflationRateRequest request, String tenantId) {
        InflationRate newRate = new InflationRate();
        newRate.setYear(request.getYear());
        newRate.setMonth(request.getMonth());
        newRate.setRate(request.getRate());
        newRate.setType(request.getType());
        newRate.setTenantId(tenantId);
        return inflationRateRepository.save(newRate);
    }

    public List<InflationRate> getAllInflationRates(String tenantId) {
        // İleride filtreleme (yıl, ay, tip) eklenebilir.
        return inflationRateRepository.findAll();
    }

    public InflationRate updateInflationRate(String id, InflationRateRequest request, String tenantId) {
        InflationRate existingRate = inflationRateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enflasyon oranı kaydı bulunamadı."));

        if (!existingRate.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu kaydı güncelleme yetkiniz yok.");
        }

        existingRate.setYear(request.getYear());
        existingRate.setMonth(request.getMonth());
        existingRate.setRate(request.getRate());
        existingRate.setType(request.getType());

        return inflationRateRepository.save(existingRate);
    }

    public void deleteInflationRate(String id, String tenantId) {
        InflationRate rateToDelete = inflationRateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enflasyon oranı kaydı bulunamadı."));

        if (!rateToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu kaydı silme yetkiniz yok.");
        }

        inflationRateRepository.delete(rateToDelete);
    }
}