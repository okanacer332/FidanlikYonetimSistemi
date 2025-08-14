package com.fidanlik.fidanysserver.goodsreceipt.dto;

import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt; // GoodsReceipt import'ını ekleyin
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GoodsReceiptRequest {
    private String receiptNumber; // İrsaliye Numarası
    // Eski supplierId kaldırıldı, yerine sourceType ve sourceId geldi
    // private String supplierId;
    private String warehouseId;
    private List<ReceiptItemDto> items;
    private LocalDateTime receiptDate;

    // YENİ EKLENEN ALANLAR (GoodsReceipt modelindeki değişikliklere uygun)
    private GoodsReceipt.SourceType sourceType; // Mal girişinin kaynağı (Tedarikçi mi, Üretim Partisi mi?)
    private String sourceId; // sourceType'a göre ya supplierId ya da productionBatchId
}