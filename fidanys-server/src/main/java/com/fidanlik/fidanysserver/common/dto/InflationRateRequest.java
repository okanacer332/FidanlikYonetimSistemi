package com.fidanlik.fidanysserver.common.dto;

import lombok.Data;
import java.math.BigDecimal;
import jakarta.validation.constraints.Max; // DÜZELTME
import jakarta.validation.constraints.Min; // DÜZELTME
import jakarta.validation.constraints.NotNull; // DÜZELTME

@Data
public class InflationRateRequest {
    @NotNull(message = "Yıl boş olamaz")
    @Min(value = 2000, message = "Yıl 2000'den küçük olamaz")
    private Integer year;

    @NotNull(message = "Ay boş olamaz")
    @Min(value = 1, message = "Ay 1'den küçük olamaz")
    @Max(value = 12, message = "Ay 12'den büyük olamaz")
    private Integer month;

    @NotNull(message = "Oran boş olamaz")
    @Min(value = 0, message = "Oran negatif olamaz")
    private BigDecimal rate; // Aylık enflasyon oranı (örn: %2 için 0.02)
}