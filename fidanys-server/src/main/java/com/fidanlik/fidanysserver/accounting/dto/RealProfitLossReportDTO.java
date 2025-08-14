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
    private YearMonth period; // Rapor dönemi (örn: YIL-AY)

    // Gelirler
    private BigDecimal nominalRevenue;
    private BigDecimal realRevenue;

    // Satılan Mal Maliyeti (COGS - Cost of Goods Sold)
    private BigDecimal nominalCostOfGoodsSold;
    private BigDecimal realCostOfGoodsSold;

    // Giderler
    private BigDecimal nominalOperatingExpenses;
    private BigDecimal realOperatingExpenses;

    // Kar Zarar
    private BigDecimal nominalGrossProfit; // nominalRevenue - nominalCostOfGoodsSold
    private BigDecimal realGrossProfit; // realRevenue - realCostOfGoodsSold

    private BigDecimal nominalNetProfit; // nominalGrossProfit - nominalOperatingExpenses
    private BigDecimal realNetProfit; // realGrossProfit - realOperatingExpenses

    // Aylık enflasyon düzeltme çarpanları (gerekirse detay için)
    // private Map<YearMonth, BigDecimal> monthlyInflationFactors;

    // Baz alınan enflasyon tarihi (raporun tüm değerlerinin güncellendiği tarih)
    private LocalDate baseInflationDate;
}