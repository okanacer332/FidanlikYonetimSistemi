package com.fidanlik.fidanysserver.goodsreceipt.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final StockService stockService;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final PlantRepository plantRepository;
    private final TransactionService transactionService; // YENİ: TransactionService enjekte edildi

    @Transactional
    public GoodsReceipt createGoodsReceipt(GoodsReceiptRequest request, String userId, String tenantId) {
        warehouseRepository.findById(request.getWarehouseId())
                .filter(w -> w.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));
        supplierRepository.findById(request.getSupplierId())
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz tedarikçi ID'si."));

        GoodsReceipt goodsReceipt = new GoodsReceipt();
        goodsReceipt.setReceiptNumber(request.getReceiptNumber());
        goodsReceipt.setSupplierId(request.getSupplierId());
        goodsReceipt.setWarehouseId(request.getWarehouseId());
        goodsReceipt.setUserId(userId);
        goodsReceipt.setTenantId(tenantId);
        goodsReceipt.setReceiptDate(LocalDateTime.now());
        goodsReceipt.setItems(request.getItems().stream().map(this::mapDtoToItem).collect(Collectors.toList()));
        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.COMPLETED);

        BigDecimal totalValue = goodsReceipt.getItems().stream()
                .map(item -> item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        goodsReceipt.setTotalValue(totalValue);

        GoodsReceipt savedGoodsReceipt = goodsReceiptRepository.save(goodsReceipt);

        for (ReceiptItemDto itemDto : request.getItems()) {
            plantRepository.findById(itemDto.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + itemDto.getPlantId()));

            String description = "Mal Kabul - İrsaliye No: " + request.getReceiptNumber();
            stockService.changeStock(
                    itemDto.getPlantId(),
                    request.getWarehouseId(),
                    itemDto.getQuantity(),
                    StockMovement.MovementType.GOODS_RECEIPT,
                    savedGoodsReceipt.getId(),
                    description,
                    userId,
                    tenantId
            );
        }

        // --- YENİ: CARİ HESABA ALACAK KAYDI OLUŞTURMA ---
        transactionService.createSupplierTransaction(
                savedGoodsReceipt.getSupplierId(),
                Transaction.TransactionType.CREDIT, // Tedarikçi Alacaklandırılıyor
                savedGoodsReceipt.getTotalValue(),
                "#" + savedGoodsReceipt.getReceiptNumber() + " nolu irsaliye ile mal alımı.",
                savedGoodsReceipt.getId(),
                userId,
                tenantId
        );

        return savedGoodsReceipt;
    }

    public List<GoodsReceipt> getAllGoodsReceiptsByTenant(String tenantId) {
        return goodsReceiptRepository.findAllByTenantId(tenantId);
    }

    @Transactional
    public void cancelGoodsReceipt(String receiptId, String userId, String tenantId) {
        GoodsReceipt goodsReceipt = goodsReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mal giriş kaydı bulunamadı."));

        if (!goodsReceipt.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu kaydı iptal etme yetkiniz yok.");
        }

        if (goodsReceipt.getStatus() == GoodsReceipt.GoodsReceiptStatus.CANCELED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kayıt zaten iptal edilmiş.");
        }

        for (GoodsReceiptItem item : goodsReceipt.getItems()) {
            String description = "İptal - İrsaliye No: " + goodsReceipt.getReceiptNumber();
            stockService.changeStock(
                    item.getPlantId(),
                    goodsReceipt.getWarehouseId(),
                    -item.getQuantity(), // Stoktan düş
                    StockMovement.MovementType.GOODS_RECEIPT_CANCEL,
                    goodsReceipt.getId(),
                    description,
                    userId,
                    tenantId
            );
        }

        // --- YENİ: CARİ HESAPTAN ALACAĞI SİLME (BORÇ KAYDI) ---
        transactionService.createSupplierTransaction(
                goodsReceipt.getSupplierId(),
                Transaction.TransactionType.DEBIT, // Alacak iptali için Borç kaydı
                goodsReceipt.getTotalValue(),
                "#" + goodsReceipt.getReceiptNumber() + " nolu irsaliyenin iptali.",
                goodsReceipt.getId(),
                userId,
                tenantId
        );

        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.CANCELED);
        goodsReceiptRepository.save(goodsReceipt);
    }

    private GoodsReceiptItem mapDtoToItem(ReceiptItemDto dto) {
        GoodsReceiptItem item = new GoodsReceiptItem();
        item.setPlantId(dto.getPlantId());
        item.setQuantity(dto.getQuantity());
        item.setPurchasePrice(dto.getPurchasePrice());
        return item;
    }
}