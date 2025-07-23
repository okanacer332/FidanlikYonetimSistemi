package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class TcmbResponse {

    // JSON'daki "items" dizisini bu List<TcmbItem> listesine ata.
    @JsonProperty("items")
    private List<TcmbItem> items;
}