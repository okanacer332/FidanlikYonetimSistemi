package com.fidanlik.fidanysserver.inflation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Yeni import
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // JSON'da tanımlı olmayan alanları yok say
public class TcmbResponse {
    @JsonProperty("items") // Genellikle 'items' anahtarı altında liste bulunur
    private List<TcmbItem> items;
    // Eğer EVDS API yanıtında totalCount, pageSize gibi başka alanlar varsa
    // ve bunları kullanacaksanız buraya ekleyebilirsiniz:
    // @JsonProperty("totalCount")
    // private Integer totalCount;
}