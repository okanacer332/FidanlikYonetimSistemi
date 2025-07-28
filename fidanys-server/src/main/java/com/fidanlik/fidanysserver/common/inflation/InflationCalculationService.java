// fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/inflation/InflationCalculationService.java
package com.fidanlik.fidanysserver.common.inflation;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class InflationCalculationService {

    private final InflationDataRepository inflationDataRepository;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    // Belirli bir aya ait aylık enflasyon oranını (ondalık formda) döndürür.
    // Eğer o aya ait veri yoksa, o tarihten önceki veya o tarihe eşit en son mevcut veriyi bulmaya çalışır.
    // Hiç veri bulunamazsa, 0 (sıfır) oran döndürülür, yani enflasyon etkisi olmadığı varsayılır.
    public BigDecimal getMonthlyInflationRate(LocalDate date) {
        LocalDate lastDayOfMonth = date.withDayOfMonth(date.lengthOfMonth());

        Optional<InflationData> inflationDataOptional = inflationDataRepository.findByDate(lastDayOfMonth);

        if (inflationDataOptional.isPresent()) {
            BigDecimal rate = inflationDataOptional.get().getValue();
            BigDecimal decimalRate = rate.divide(HUNDRED, 10, RoundingMode.HALF_UP);
            log.info("Aylık enflasyon oranı bulundu: {} -> {}% (ondalık: {})", lastDayOfMonth, rate, decimalRate);
            return decimalRate;
        } else {
            log.warn("Aylık enflasyon oranı tam olarak {} için bulunamadı. Önceki en son mevcut tarih aranıyor...", lastDayOfMonth);
            Optional<InflationData> latestBeforeOrEqualToOptional = inflationDataRepository.findTopByDateLessThanEqualOrderByDateDesc(lastDayOfMonth);

            if (latestBeforeOrEqualToOptional.isPresent()) {
                InflationData latestData = latestBeforeOrEqualToOptional.get();
                BigDecimal rate = latestData.getValue();
                BigDecimal decimalRate = rate.divide(HUNDRED, 10, RoundingMode.HALF_UP);
                log.info("Aylık enflasyon oranı {} için bulunamadığından, en yakın önceki tarih {} kullanıldı. Oran: {}% (ondalık: {})",
                        lastDayOfMonth, latestData.getDate(), rate, decimalRate);
                return decimalRate;
            } else {
                log.warn("Enflasyon oranı bulunamadı: {} için hiçbir geçmiş veya eşleşen kayıt yok. Oran 0 kabul ediliyor.", lastDayOfMonth);
                return BigDecimal.ZERO;
            }
        }
    }

    // Veritabanındaki en son (en güncel tarihli) enflasyon verisinin tarihini döndürür.
    public Optional<LocalDate> getLatestAvailableInflationDate() {
        return inflationDataRepository.findTopByOrderByDateDesc()
                .map(InflationData::getDate);
    }

    // Nominal bir tutarı, işlem tarihinden hedef tarihe kadar aylık enflasyon oranlarına göre düzeltir.
    public BigDecimal calculateRealValue(BigDecimal nominalAmount, LocalDate transactionDate, LocalDate targetDate) {
        log.info("calculateRealValue çağrıldı. Nominal: {}, İşlem Tarihi: {}, Hedef Tarih: {}", nominalAmount, transactionDate, targetDate);

        // Eğer işlem ve hedef tarihler aynı aydaysa, düzeltme yapma
        if (transactionDate.getYear() == targetDate.getYear() && transactionDate.getMonth() == targetDate.getMonth()) {
            log.info("İşlem tarihi ve hedef tarih aynı ayda olduğundan reel düzeltme yapılmadı. Nominal: {}, Tarihler: {} -> {}", nominalAmount, transactionDate, targetDate);
            return nominalAmount;
        }

        BigDecimal cumulativeFactor = BigDecimal.ONE;
        LocalDate startMonth = transactionDate.withDayOfMonth(1);
        LocalDate endMonth = targetDate.withDayOfMonth(1);

        if (startMonth.isBefore(endMonth)) { // İleriye doğru düzeltme (Enflasyon)
            LocalDate currentMonthIterator = startMonth.plusMonths(1); // İşlem ayının bir sonraki ayından başla
            while (!currentMonthIterator.isAfter(endMonth)) { // Hedef ay dahil
                BigDecimal monthlyRate = getMonthlyInflationRate(currentMonthIterator);
                cumulativeFactor = cumulativeFactor.multiply(BigDecimal.ONE.add(monthlyRate));
                log.info("Ay (İleri): {}, Oran: {} (Decimal), Kümülatif Çarpan: {}", currentMonthIterator.getMonth(), monthlyRate, cumulativeFactor);
                currentMonthIterator = currentMonthIterator.plusMonths(1);
            }
        } else { // Geriye doğru düzeltme (Deflasyon veya farklı birim değerine getirme)
            LocalDate currentMonthIterator = endMonth.plusMonths(1); // Hedef ayın bir sonraki ayından başla
            while (!currentMonthIterator.isAfter(startMonth)) { // İşlem ayı dahil
                BigDecimal monthlyRate = getMonthlyInflationRate(currentMonthIterator);
                // Geriye doğru düzeltme için çarpan 1 / (1 + oran) olmalı
                // Ancak burada cumulativeFactor'u çarptığımız için, oran negatifse zaten 1 + (-oran) ile azalır
                // Eğer oran pozitifse, 1/(1+oran) ile bölmemiz gerekir.
                // Basitlik adına: cumulativeFactor'u 1/(1+oran) ile çarpmak yerine, eğer geriye gidiyorsak
                // 1 / (1 + rate) faktörünü hesaplayıp çarpmalıyız.
                BigDecimal inverseFactor = BigDecimal.ONE.divide(BigDecimal.ONE.add(monthlyRate), 10, RoundingMode.HALF_UP);
                cumulativeFactor = cumulativeFactor.multiply(inverseFactor);
                log.info("Ay (Geri): {}, Oran: {} (Decimal), Ters Çarpan: {}, Kümülatif Çarpan: {}", currentMonthIterator.getMonth(), monthlyRate, inverseFactor, cumulativeFactor);
                currentMonthIterator = currentMonthIterator.plusMonths(1);
            }
        }

        log.info("Reel hesaplama tamamlandı. Nominal: {}, Kümülatif Çarpan: {}, Reel: {}", nominalAmount, cumulativeFactor, nominalAmount.multiply(cumulativeFactor).setScale(2, RoundingMode.HALF_UP));
        return nominalAmount.multiply(cumulativeFactor).setScale(2, RoundingMode.HALF_UP);
    }
}