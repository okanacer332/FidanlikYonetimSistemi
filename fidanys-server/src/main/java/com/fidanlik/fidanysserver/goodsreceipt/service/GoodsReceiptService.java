// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/service/GoodsReceiptService.java
package com.fidanlik.fidanysserver.goodsreceipt.service;

import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.goodsreceipt.dto.GoodsReceiptRequest;
import com.fidanlik.fidanysserver.goodsreceipt.dto.ReceiptItemDto;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceiptItem;
import com.fidanlik.fidanysserver.goodsreceipt.repository.GoodsReceiptRepository;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final StockService stockService;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final PlantRepository plantRepository;

    @Transactional
    public GoodsReceipt createGoodsReceipt(GoodsReceiptRequest request, String userId, String tenantId) {
        // Gerekli doğrulamaları yap
        warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));
        supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz tedarikçi ID'si."));

        // Mal kabul kaydını oluştur
        GoodsReceipt goodsReceipt = new GoodsReceipt();
        goodsReceipt.setReceiptNumber(request.getReceiptNumber());
        goodsReceipt.setSupplierId(request.getSupplierId());
        goodsReceipt.setWarehouseId(request.getWarehouseId());
        goodsReceipt.setUserId(userId);
        goodsReceipt.setTenantId(tenantId);
        goodsReceipt.setReceiptDate(LocalDateTime.now());
        goodsReceipt.setItems(request.getItems().stream().map(this::mapDtoToItem).collect(Collectors.toList()));

        GoodsReceipt savedGoodsReceipt = goodsReceiptRepository.save(goodsReceipt);

        // Her bir kalem için stokları güncelle
        for (ReceiptItemDto itemDto : request.getItems()) {
            // Fidanın varlığını kontrol et
            plantRepository.findById(itemDto.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + itemDto.getPlantId()));

            String description = "Mal Kabul - İrsaliye No: " + request.getReceiptNumber();

            stockService.changeStock(
                    itemDto.getPlantId(),
                    request.getWarehouseId(),
                    itemDto.getQuantity(), // Pozitif miktar
                    StockMovement.MovementType.GOODS_RECEIPT,
                    savedGoodsReceipt.getId(),
                    description,
                    userId,
                    tenantId
            );
            // TODO: Muhasebe modülü eklendiğinde, itemDto.getPurchasePrice() kullanılarak bir gider işlemi oluşturulabilir.
        }

        return savedGoodsReceipt;
    }

    private GoodsReceiptItem mapDtoToItem(ReceiptItemDto dto) {
        GoodsReceiptItem item = new GoodsReceiptItem();
        item.setPlantId(dto.getPlantId());
        item.setQuantity(dto.getQuantity());
        item.setPurchasePrice(dto.getPurchasePrice());
        return item;
    }
}