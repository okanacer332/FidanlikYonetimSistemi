package com.fidanlik.fidanysserver.common.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Document(collection = "inflation_rates")
@CompoundIndex(def = "{'year': 1, 'month': 1, 'tenantId': 1}", unique = true) // Yıl, Ay ve Tenant bazında benzersizlik
public class InflationRate {
    @Id
    private String id;
    private int year;
    private int month; // 1-12 arası
    private BigDecimal rate; // Aylık enflasyon oranı (örn: %2 için 0.02)
    private String tenantId;
}