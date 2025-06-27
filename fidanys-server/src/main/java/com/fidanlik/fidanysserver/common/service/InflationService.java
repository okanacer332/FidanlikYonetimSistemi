package com.fidanlik.fidanysserver.common.service;

import com.fidanlik.fidanysserver.common.dto.InflationRateRequest;
import com.fidanlik.fidanysserver.common.model.InflationRate;
import com.fidanlik.fidanysserver.common.repository.InflationRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional; // Optional importu

@Service
@RequiredArgsConstructor
public class InflationService {

    private final InflationRateRepository inflationRateRepository;

    public InflationRate createInflationRate(InflationRateRequest request, String tenantId) {
        // Aynı yıl, ay ve tenant için zaten bir kayıt var mı kontrol et
        if (inflationRateRepository.findByYearAndMonthAndTenantId(request.getYear(), request.getMonth(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu ay ve yıla ait enflasyon oranı zaten tanımlanmış.");
        }

        InflationRate inflationRate = new InflationRate();
        inflationRate.setYear(request.getYear());
        inflationRate.setMonth(request.getMonth());
        inflationRate.setRate(request.getRate());
        inflationRate.setTenantId(tenantId);
        return inflationRateRepository.save(inflationRate);
    }

    public List<InflationRate> getAllInflationRatesByTenant(String tenantId) {
        return inflationRateRepository.findAllByTenantIdOrderByYearAscMonthAsc(tenantId);
    }

    /**
     * İki tarih arasındaki kümülatif enflasyon faktörünü hesaplar.
     * Örneğin, Ocak ayında 1.000 TL olan bir değerin Mart ayındaki karşılığını bulmak için.
     * Ocak oranı %2, Şubat %3 ise: (1 + 0.02) * (1 + 0.03)
     *
     * @param startDate Hesaplamanın başlayacağı tarih (dahil).
     * @param endDate   Hesaplamanın biteceği tarih (dahil).
     * @param tenantId  İlgili şirketin ID'si.
     * @return Kümülatif enflasyon faktörü. Eğer enflasyon verisi bulunamazsa 1.0 (değişim yok) döner.
     */
    public BigDecimal calculateInflationFactor(LocalDate startDate, LocalDate endDate, String tenantId) {
        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Başlangıç tarihi bitiş tarihinden sonra olamaz.");
        }

        // Başlangıç ve bitiş tarihlerine denk gelen aylar ve yılları içeren enflasyon oranlarını çek.
        // Tarih aralığına dikkat: startDate'in ayından endDate'in ayına kadar olan oranlar alınmalı.
        // Örneğin, Ocak'tan (startDate) Temmuz'a (endDate) kadar enflasyon hesaplanacaksa,
        // Ocak, Şubat, Mart, Nisan, Mayıs, Haziran, Temmuz aylarının oranları kullanılmalı.
        List<InflationRate> rates = inflationRateRepository.findAllByTenantIdOrderByYearAscMonthAsc(tenantId);

        BigDecimal cumulativeFactor = BigDecimal.ONE;

        boolean foundStart = false;
        for (InflationRate rate : rates) {
            LocalDate rateDate = LocalDate.of(rate.getYear(), rate.getMonth(), 1);

            // Enflasyon hesaplamasına başlangıç tarihinden (dahil) itibaren başla.
            // Sadece enflasyon faktörünü hesaplarken, geçmişteki maliyetin o aya taşınması için o ayın oranını da kullanırız.
            // Yani, Ocak maliyeti için Ocak oranı, Şubat maliyeti için Şubat oranı...
            // O yüzden 'rateDate' <= 'endDate' olmalı.
            if (!rateDate.isBefore(startDate) && !rateDate.isAfter(endDate)) {
                cumulativeFactor = cumulativeFactor.multiply(BigDecimal.ONE.add(rate.getRate()));
                foundStart = true;
            } else if (foundStart && rateDate.isAfter(endDate)) {
                // Başlangıcı bulduk ve bitiş tarihini geçtik, döngüyü kırabiliriz.
                break;
            }
        }

        // Eğer hiç enflasyon oranı bulunamazsa veya aralıkta uygun veri yoksa, 1.0 döner.
        return cumulativeFactor;
    }

}