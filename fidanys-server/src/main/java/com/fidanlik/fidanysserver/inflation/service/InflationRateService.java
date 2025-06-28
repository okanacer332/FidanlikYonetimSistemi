package com.fidanlik.fidanysserver.inflation.service;

import com.fidanlik.fidanysserver.inflation.model.InflationRate;
import com.fidanlik.fidanysserver.inflation.repository.InflationRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InflationRateService {

    private final InflationRateRepository inflationRateRepository;

    public InflationRate createInflationRate(InflationRate inflationRate, String tenantId) {
        // Aynı yıl, ay ve tenant için zaten bir kayıt olup olmadığını kontrol et
        if (inflationRateRepository.findByYearAndMonthAndTenantId(inflationRate.getYear(), inflationRate.getMonth(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu ay ve yıla ait enflasyon oranı bu şirkette zaten mevcut.");
        }
        inflationRate.setTenantId(tenantId);
        return inflationRateRepository.save(inflationRate);
    }

    public List<InflationRate> getAllInflationRatesByTenant(String tenantId) {
        return inflationRateRepository.findAllByTenantId(tenantId);
    }

    public InflationRate getInflationRateByYearAndMonth(int year, int month, String tenantId) {
        return inflationRateRepository.findByYearAndMonthAndTenantId(year, month, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Belirtilen ay ve yıla ait enflasyon oranı bulunamadı."));
    }

    public InflationRate updateInflationRate(String id, InflationRate updatedDetails, String tenantId) {
        InflationRate existingRate = inflationRateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek enflasyon oranı bulunamadı."));

        if (!existingRate.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin enflasyon oranını güncellemeye yetkiniz yok.");
        }

        // Eğer yıl veya ay değişiyorsa, yeni kombinasyonun benzersizliğini kontrol et
        if (existingRate.getYear() != updatedDetails.getYear() || existingRate.getMonth() != updatedDetails.getMonth()) {
            if (inflationRateRepository.findByYearAndMonthAndTenantId(updatedDetails.getYear(), updatedDetails.getMonth(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu ay ve yıla ait enflasyon oranı bu şirkette zaten mevcut.");
            }
        }

        existingRate.setYear(updatedDetails.getYear());
        existingRate.setMonth(updatedDetails.getMonth());
        existingRate.setRate(updatedDetails.getRate());

        return inflationRateRepository.save(existingRate);
    }

    public void deleteInflationRate(String id, String tenantId) {
        InflationRate rateToDelete = inflationRateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek enflasyon oranı bulunamadı."));

        if (!rateToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin enflasyon oranını silmeye yetkiniz yok.");
        }

        inflationRateRepository.delete(rateToDelete);
    }
}