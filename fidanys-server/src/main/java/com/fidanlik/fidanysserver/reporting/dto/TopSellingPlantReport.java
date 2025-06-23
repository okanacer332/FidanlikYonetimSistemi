package com.fidanlik.fidanysserver.reporting.dto;

import lombok.Data;

@Data
public class TopSellingPlantReport {
    private String plantTypeName;
    private String plantVarietyName;
    private int totalQuantitySold;
}
