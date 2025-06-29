package com.fidanlik.fidanysserver.stock.dto;

import lombok.Data;

// Doğrulama (validation) anotasyonları ve importları geçici olarak kaldırıldı.
// import javax.validation.constraints.Min;
// import javax.validation.constraints.NotBlank;
// import javax.validation.constraints.NotNull;

@Data
public class WastageRequest {
    // @NotBlank(message = "Fidan ID'si boş olamaz.") // Geçici olarak kaldırıldı
    private String plantId;

    // @NotBlank(message = "Depo ID'si boş olamaz.") // Geçici olarak kaldırıldı
    private String warehouseId;

    // @Min(value = 1, message = "Miktar en az 1 olmalıdır.") // Geçici olarak kaldırıldı
    private int quantity;

    private String description; // Opsiyonel

    private String productionBatchId; // Bu zayiatın ait olduğu üretim partisi ID'si. Opsiyonel olabilir.
}