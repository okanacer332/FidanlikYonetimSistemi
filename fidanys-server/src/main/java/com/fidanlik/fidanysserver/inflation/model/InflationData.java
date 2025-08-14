package com.fidanlik.fidanysserver.inflation.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field; // Field anotasyonu için import
import java.math.BigDecimal; // BigDecimal için import
import java.time.LocalDate;

@Document(collection = "inflation_data")
@Data
public class InflationData {
    @Id
    private String id;
    private LocalDate date;

    @Field("value") // Veritabanında "value" olarak saklanmasını sağlar
    private BigDecimal value; // Tipi double'dan BigDecimal'a, adı inflationRate'ten value'ya değiştirildi

    // Yeni EVDS API'sinden gelen seri adını saklamak için eklenebilir
    @Field("seriesName")
    private String seriesName;
}