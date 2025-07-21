package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

// TCMB'den gelen JSON içerisindeki her bir veri öğesini temsil eder.
// Bilinmeyen alanları yoksaymak için @JsonIgnoreProperties kullanılır.
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TcmbItemDto {

    // JSON'daki "TARIH" alanını bu alana map eder.
    @JsonProperty("TARIH")
    private String date; // Örn: "01-06-2024"

    // JSON'daki "TP.DK.CPI.A" (TÜFE) alanını bu alana map eder.
    // Postman'de kullandığınız serinin adı budur.
    @JsonProperty("TP.DK.CPI.A")
    private String cpiValue;
}