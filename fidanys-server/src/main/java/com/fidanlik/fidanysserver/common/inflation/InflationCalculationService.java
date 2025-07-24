// Yeni konum: fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/inflation/InflationCalculationService.java
package com.fidanlik.fidanysserver.common.inflation;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InflationCalculationService {

    private final InflationDataRepository inflationDataRepository;

    // Belirli bir tarihe ait enflasyon endeksini getirir. (Ayın ilk günü olarak kabul edilir)
    public BigDecimal getInflationIndexForDate(LocalDate date) {
        LocalDate firstDayOfMonth = date.withDayOfMonth(1);
        Optional<InflationData> inflationDataOptional = inflationDataRepository.findByDate(firstDayOfMonth);

        if (inflationDataOptional.isPresent()) {
            return inflationDataOptional.get().getValue();
        } else {
            // Eğer o aya ait veri yoksa, en yakın önceki ayı bulmaya çalışabiliriz
            // Veya burada bir hata fırlatabiliriz. Şimdilik hata fırlatıyorum.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enflasyon verisi bulunamadı: " + firstDayOfMonth);
        }
    }

    // Nominal bir tutarı, işlem tarihinden hedef tarihe kadar enflasyona göre düzeltir.
    public BigDecimal calculateRealValue(BigDecimal nominalAmount, LocalDate transactionDate, LocalDate targetDate) {
        if (nominalAmount == null || nominalAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal indexTransaction = getInflationIndexForDate(transactionDate);
            BigDecimal indexTarget = getInflationIndexForDate(targetDate);

            // Endeksler sıfır veya null olmamalı
            if (indexTransaction.compareTo(BigDecimal.ZERO) == 0 || indexTarget.compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalArgumentException("Enflasyon endeksleri sıfır olamaz.");
            }

            // Real Value = Nominal Value * (Index_Target / Index_Transaction)
            BigDecimal factor = indexTarget.divide(indexTransaction, 4, RoundingMode.HALF_UP);
            return nominalAmount.multiply(factor).setScale(2, RoundingMode.HALF_UP);

        } catch (ResponseStatusException e) {
            // Enflasyon verisi bulunamazsa, nominal değeri döndürebilir veya hata fırlatabiliriz.
            // Rapor bütünlüğünü korumak adına nominali döndürüyorum, ancak loglama önemli.
            // log.warn("Enflasyon verisi bulunamadığı için nominal değer kullanıldı: {}", e.getMessage());
            return nominalAmount; // Eğer enflasyon verisi yoksa nominal değeri gerçek değer olarak kabul et.
        } catch (IllegalArgumentException e) {
            // Sıfır endeks gibi hesaplama hataları için
            // log.error("Enflasyon hesaplama hatası: {}", e.getMessage());
            return nominalAmount;
        }
    }
}