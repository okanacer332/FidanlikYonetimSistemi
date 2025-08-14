package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // JSON'da tanımlı olmayan alanları yok say
public class TcmbItem {
    @JsonProperty("Tarih") // JSON'dan gelen doğru tarih alanı adı
    private String date;

    @JsonProperty("TP_FG_J01-1") // JSON'dan gelen doğru değer alanı adı
    private String value;

    // JSON yanıtında her bir öğe için doğrudan bir 'seriesCode' veya 'KOD' alanı bulunmuyor.
    // Bu alanı buradan kaldırıyoruz ve InflationService'de doğrudan atayacağız.
    // private String seriesCode;
}