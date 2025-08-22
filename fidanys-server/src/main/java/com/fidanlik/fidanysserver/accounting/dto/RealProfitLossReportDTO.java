// Yeni konum: fidanys-server/src/main/java/com/fidanlik/fidanysserver/accounting/dto/RealProfitLossReportDTO.java
package com.fidanlik.fidanysserver.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;

@Data
@Builder
public class RealProfitLossReportDTO {
    private YearMonth period;

    // --- Şelale Grafiği Verileri ---
    private BigDecimal nominalRevenue;          // Şelale grafiğinin ilk yeşil sütunu (Gelirler)
    private BigDecimal nominalCostOfGoodsSold;  // İlk kırmızı düşüş (Satılan Malın Maliyeti)
    private BigDecimal nominalOperatingExpenses;// İkinci kırmızı düşüş (İşletme Giderleri)
    private BigDecimal nominalNetProfit;        // Üçüncü mavi sütun (Nominal Kâr)
    private BigDecimal realNetProfit;           // Son yeşil sütun (Reel Kâr)

    // --- Pasta Grafiği ve Özet Tablo Verileri ---
    // nominalNetProfit ve realNetProfit zaten yukarıda mevcut.
    // Enflasyon Etkisi, bu ikisinin farkı olarak frontend'de hesaplanabilir veya burada eklenebilir.

    // --- Diğer Bilgilendirici Alanlar ---
    private BigDecimal realRevenue;
    private BigDecimal realCostOfGoodsSold;
    private BigDecimal realOperatingExpenses;
    private BigDecimal nominalGrossProfit;
    private BigDecimal realGrossProfit;
    private LocalDate baseInflationDate;
}