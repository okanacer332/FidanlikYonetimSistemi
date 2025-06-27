package com.fidanlik.fidanysserver.goodsreceipt.dto;

import com.fidanlik.fidanysserver.stock.model.Stock; // StockType enum'ı için import
import lombok.Data;
import java.util.List;

@Data
public class GoodsReceiptRequest {
    // Mevcut Alanlar
    private String receiptNumber;
    private String supplierId;
    private String warehouseId;
    private List<ReceiptItemDto> items;

    // --- YENİ EKLENEN ALANLAR ---
    private Stock.StockType entryType; // Girişin tipini belirtir: COMMERCIAL veya IN_PRODUCTION
    private String batchName; // Sadece entryType = IN_PRODUCTION ise kullanılır. Örn: "Ocak 2025 Ceviz"
}