package com.fidanlik.fidanysserver.accounting.dto;

import com.fidanlik.fidanysserver.accounting.model.InflationRate;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InflationRateRequest {
    private int year;
    private int month;
    private BigDecimal rate;
    private InflationRate.RateType type;
}