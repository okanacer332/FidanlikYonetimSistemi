package com.fidanlik.fidanysserver.production.dto;

import lombok.Data;

@Data
public class WastageRecordRequest {
    private int quantity;
    private String reason; // Opsiyonel, zayiat nedenini belirtmek için
}