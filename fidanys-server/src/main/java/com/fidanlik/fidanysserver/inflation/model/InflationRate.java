package com.fidanlik.fidanysserver.inflation.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "inflationRates")
@CompoundIndex(def = "{'year': 1, 'month': 1, 'tenantId': 1}", unique = true)
public class InflationRate {
    @Id
    private String id;
    private int year;
    private int month;
    private double rate; // Yüzde olarak (örn. 0.05 = %5)
    private String tenantId;
}