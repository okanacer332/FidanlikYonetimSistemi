package com.fidanlik.fidanysserver.inflation.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@lombok.Data
@Document(collection = "inflation_data")
public class InflationData {
    @Id
    private String id;
    private String period; // Örn: "2024-06"
    private Double cpiValue; // Tüketici Fiyat Endeksi Değeri
    private String tenantId;
}