package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

// Gelen JSON'da bizim tanımlamadığımız başka alanlar varsa hata vermemesi için bu anotasyon önemlidir.
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class TcmbItem {

    // JSON'daki "TARIH" alanını bu "date" değişkenine ata.
    @JsonProperty("TARIH")
    private String date;

    // JSON'daki "TP_FG_J01" alanını (yani enflasyon değerini) bu "value" değişkenine ata.
    @JsonProperty("TP_FG_J01")
    private String value;

    // JSON'daki seri kodunu bu değişkene ata
    @JsonProperty("SERIE_CODE")
    private String seriesCode;
}