package com.fidanlik.fidanysserver.accounting.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Document(collection = "inflation_rates")
public class InflationRate {
    @Id
    private String id;
    private int year;
    private int month;
    private BigDecimal rate;
    private RateType type;
    private String tenantId;

    public enum RateType {
        TUFE, // Tüketici Fiyat Endeksi
        UFE   // Üretici Fiyat Endeksi
    }
}