package com.fidanlik.fidanysserver.goodsreceipt.dto;

import lombok.Data;
import java.time.LocalDateTime; // LocalDateTime import edildi
import java.util.List;

@Data
public class GoodsReceiptRequest {
    private String receiptNumber; // İrsaliye Numarası
    private String supplierId;
    private String warehouseId;
    private String description; // YENİ EKLENDİ: Açıklama alanı
    private LocalDateTime receiptDate; // YENİ EKLENDİ: Makbuz tarihi alanı
    private List<ReceiptItemDto> items;
}