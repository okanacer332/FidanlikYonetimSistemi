package com.fidanlik.fidanysserver.goodsreceipt.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch; // Yeni import
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository; // Yeni import
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
    private final TransactionService transactionService;
    private final ProductionBatchRepository productionBatchRepository; // YENİ: ProductionBatchRepository enjekte edildi

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
        // mapDtoToItem metodunu güncellediğimiz için burası otomatik olarak isCommercial ve productionBatchId'yi set edecek.
        goodsReceipt.setItems(request.getItems().stream().map(this::mapDtoToItem).collect(Collectors.toList()));
        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.COMPLETED);

        BigDecimal totalValue = BigDecimal.ZERO;

        for (GoodsReceiptItem item : goodsReceipt.getItems()) {
            plantRepository.findById(item.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + item.getPlantId()));

            // YENİ MANTIK: Mal kabul kalemi ticari mal mı yoksa üretim partisi girişi mi?
            if (item.isCommercial()) {
                // Ticari Mal: Doğrudan stoğa ekle
                String description = "Mal Kabul - İrsaliye No: " + request.getReceiptNumber();
                stockService.changeStock(
                        item.getPlantId(),
                        request.getWarehouseId(),
                        item.getQuantity(),
                        StockMovement.MovementType.GOODS_RECEIPT,
                        goodsReceipt.getId(),
                        description,
                        userId,
                        tenantId
                );
            } else {
                // Üretim Partisi Girişi: Partinin miktarını ve maliyet havuzunu güncelle
                if (item.getProductionBatchId() == null || item.getProductionBatchId().isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Üretim partisi girişi için productionBatchId zorunludur.");
                }

                ProductionBatch batch = productionBatchRepository.findById(item.getProductionBatchId())
                        .filter(b -> b.getTenantId().equals(tenantId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz üretim partisi ID'si."));

                // Partinin mevcut fidan adedini artır
                batch.setCurrentQuantity(batch.getCurrentQuantity() + item.getQuantity());
                // Partinin maliyet havuzuna bu kalemin toplam alış fiyatını ekle
                batch.setCostPool(batch.getCostPool().add(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity()))));
                productionBatchRepository.save(batch);

                // Bu durumda PlantRepository'deki genel stoğa ekleme yapılmaz, çünkü fidanlar parti içinde yönetiliyor.
            }
            totalValue = totalValue.add(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity())));
        }
        goodsReceipt.setTotalValue(totalValue); // TotalValue'yu döngüden sonra tekrar set ettik

        GoodsReceipt savedGoodsReceipt = goodsReceiptRepository.save(goodsReceipt); // Mal kabulü kaydet

        // Cari hesaba alacak kaydı oluşturma (Bu kısım aynı kalabilir)
        transactionService.createSupplierTransaction(
                savedGoodsReceipt.getSupplierId(),
                Transaction.TransactionType.CREDIT,
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

            // İptal işlemi de ticari mal / üretim partisi ayrımına göre yapılmalı
            if (item.isCommercial()) {
                // Ticari mal ise genel stoktan düş (negatif miktar ile)
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
            } else {
                // Üretim partisi ise partinin miktarını ve maliyet havuzunu geri al
                ProductionBatch batch = productionBatchRepository.findById(item.getProductionBatchId())
                        .filter(b -> b.getTenantId().equals(tenantId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Üretim partisi bulunamadı."));

                // Partinin mevcut fidan adedini azalt
                batch.setCurrentQuantity(batch.getCurrentQuantity() - item.getQuantity());
                // Partinin maliyet havuzundan bu kalemin toplam alış fiyatını çıkar
                batch.setCostPool(batch.getCostPool().subtract(item.getPurchasePrice().multiply(new BigDecimal(item.getQuantity()))));
                productionBatchRepository.save(batch);
            }
        }

        // Cari hesaptan alacağı silme (Borç kaydı) (Bu kısım aynı kalabilir)
        transactionService.createSupplierTransaction(
                goodsReceipt.getSupplierId(),
                Transaction.TransactionType.DEBIT,
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
        item.setCommercial(dto.isCommercial()); // YENİ: isCommercial set edildi
        item.setProductionBatchId(dto.getProductionBatchId()); // YENİ: productionBatchId set edildi
        return item;
    }
}