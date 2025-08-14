// fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/dto/StockSummaryDTO.java
package com.fidanlik.fidanysserver.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockSummaryDTO {
    private String plantIdentityId; // FidanIdentity'nin ID'si
    private String plantTypeName;
    private String plantVarietyName;
    private String rootstockName;
    private String plantSizeName;
    private String plantAgeName;
    private String warehouseId; // Depo ID'si
    private String warehouseName;
    private double totalQuantity;
    private String status; // Stok durumu (örneğin "Mevcut")
}