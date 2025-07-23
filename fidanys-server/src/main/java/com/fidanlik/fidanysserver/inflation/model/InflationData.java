package com.fidanlik.fidanysserver.inflation.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;

// Bu sınıfın bir MongoDB koleksiyonuna karşılık geldiğini belirtir
@Document(collection = "inflation_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InflationData {

    // MongoDB'nin birincil anahtarı olduğunu belirtir
    @Id
    private String id;

    // Bu alanın üzerinde bir indeks oluşturarak sorguları hızlandırır ve benzersiz olmasını sağlar
    @Indexed(unique = true)
    @Field(name = "date") // MongoDB'deki alan adını belirtir
    private LocalDate date;

    @Field(name = "value")
    private BigDecimal value;

    @Field(name = "series_name")
    private String seriesName;
}