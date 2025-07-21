package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

// TCMB'den gelen ana JSON yanıtını temsil eder.
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TcmbResponseDto {

    // JSON'daki "items" dizisini bu listeye map eder.
    @JsonProperty("items")
    private List<TcmbItemDto> items;
}