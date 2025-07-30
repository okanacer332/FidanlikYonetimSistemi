package com.fidanlik.fidanysserver.goodsreceipt.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
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
    private final ProductionBatchRepository productionBatchRepository;

    @Transactional
    public GoodsReceipt createGoodsReceipt(GoodsReceiptRequest request, String userId, String tenantId) {
        // Depo kontrolü
        warehouseRepository.findById(request.getWarehouseId())
                .filter(w -> w.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));

        // GoodsReceipt modeli güncellendiği için sourceId ve sourceType kullanılıyor
        // SupplierId kontrolü sadece sourceType SUPPLIER ise yapılır
        if (request.getSourceType() == GoodsReceipt.SourceType.SUPPLIER) {
            supplierRepository.findById(request.getSourceId())
                    .filter(s -> s.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz tedarikçi ID'si."));
        } else if (request.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
            productionBatchRepository.findById(request.getSourceId())
                    .filter(b -> b.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz üretim partisi ID'si."));
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz mal giriş kaynağı tipi.");
        }


        GoodsReceipt goodsReceipt = new GoodsReceipt();
        goodsReceipt.setReceiptNumber(request.getReceiptNumber());
        goodsReceipt.setSourceType(request.getSourceType()); // Yeni eklenen alan
        goodsReceipt.setSourceId(request.getSourceId());     // Yeni eklenen alan
        goodsReceipt.setWarehouseId(request.getWarehouseId());
        goodsReceipt.setUserId(userId);
        goodsReceipt.setTenantId(tenantId);
        goodsReceipt.setReceiptDate(request.getReceiptDate());

        // Items'ı map etmeden önce unitCost'u hesaplamamız gerekebilir
        List<GoodsReceiptItem> goodsReceiptItems = request.getItems().stream()
                .map(dto -> {
                    GoodsReceiptItem item = new GoodsReceiptItem();
                    item.setPlantId(dto.getPlantId());
                    item.setQuantity(dto.getQuantity());
                    // unitCost, sourceType'a göre belirlenir
                    if (request.getSourceType() == GoodsReceipt.SourceType.SUPPLIER) {
                        item.setUnitCost(dto.getUnitCost()); // DTO'dan gelen alış fiyatı/birim maliyet
                    } else if (request.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
                        // Üretim partisinden gelen fidanlar için birim maliyeti hesapla
                        ProductionBatch batch = productionBatchRepository.findById(request.getSourceId())
                                .filter(b -> b.getTenantId().equals(tenantId))
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Üretim partisi bulunamadı."));

                        // Birim maliyet hesaplama: toplam maliyet havuzu / mevcut miktar
                        // currentQuantity sıfır olabilir, bu durumda hata fırlat veya özel bir değer ata.
                        if (batch.getCostPool() == null || batch.getCurrentQuantity() == 0) {
                            // Bu senaryoda uygun bir hata veya varsayılan değer ataması yapılmalı.
                            // Örneğin, bu noktada fidanın maliyeti bilinemediği için hata fırlatılabilir.
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Üretim partisi maliyeti veya mevcut miktarı bulunamadı.");
                        }
                        BigDecimal unitCost = batch.getCostPool().divide(new BigDecimal(batch.getCurrentQuantity()), 4, BigDecimal.ROUND_HALF_UP);
                        item.setUnitCost(unitCost);
                    }
                    return item;
                }).collect(Collectors.toList());

        goodsReceipt.setItems(goodsReceiptItems);
        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.COMPLETED);

        BigDecimal totalValue = BigDecimal.ZERO;

        for (GoodsReceiptItem item : goodsReceipt.getItems()) {
            plantRepository.findById(item.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + item.getPlantId()));

            String description = "Mal Kabul - İrsaliye No: " + request.getReceiptNumber();

            // Stok hareketi, malın kaynağı ne olursa olsun aynı şekilde yapılır
            stockService.changeStock(
                    item.getPlantId(),
                    request.getWarehouseId(),
                    item.getQuantity(),
                    StockMovement.MovementType.GOODS_RECEIPT,
                    goodsReceipt.getId(),
                    description,
                    userId,
                    tenantId,
                    item.getUnitCost() // Unit Cost bilgisini StockMovement'a iletiyoruz
            );

            // Eğer mal üretim partisinden geliyorsa, üretim partisinin hasat miktarını güncelle
            if (request.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
                ProductionBatch batch = productionBatchRepository.findById(request.getSourceId())
                        .filter(b -> b.getTenantId().equals(tenantId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz üretim partisi ID'si."));

                // Üretim partisinin mevcut miktarını düşürme (hasat edildiği için)
                batch.setCurrentQuantity(batch.getCurrentQuantity() - item.getQuantity());
                // Hasat edilen fidan sayısını artırma
                batch.setHarvestedQuantity(batch.getHarvestedQuantity() != null ? batch.getHarvestedQuantity() + item.getQuantity() : item.getQuantity());

                // Eğer hasat edilen miktar, başlangıçtaki miktara yakınsa partiyi kapatabiliriz.
                // Bu kısım için daha detaylı bir iş kuralı gerekebilir (örn. %95'i hasat edildiğinde)
                if (batch.getHarvestedQuantity() != null && batch.getExpectedHarvestQuantity() != null &&
                        batch.getHarvestedQuantity() >= batch.getExpectedHarvestQuantity()) {
                    batch.setStatus(ProductionBatch.BatchStatus.COMPLETED);
                } else {
                    batch.setStatus(ProductionBatch.BatchStatus.HARVESTED); // Kısmen hasat edildi
                }
                productionBatchRepository.save(batch);

                // Üretim partisinin maliyet havuzunu burada güncellemiyoruz, giderler eklendikçe güncelleniyor.
            }

            totalValue = totalValue.add(item.getUnitCost().multiply(new BigDecimal(item.getQuantity())));
        }
        goodsReceipt.setTotalValue(totalValue);

        GoodsReceipt savedGoodsReceipt = goodsReceiptRepository.save(goodsReceipt);

        // İşlem türünü sourceType'a göre ayır
        if (savedGoodsReceipt.getSourceType() == GoodsReceipt.SourceType.SUPPLIER) {
            transactionService.createSupplierTransaction(
                    savedGoodsReceipt.getSourceId(), // sourceId artık supplierId'yi tutuyor
                    Transaction.TransactionType.CREDIT,
                    savedGoodsReceipt.getTotalValue(),
                    "#" + savedGoodsReceipt.getReceiptNumber() + " nolu irsaliye ile mal alımı.",
                    savedGoodsReceipt.getId(),
                    userId,
                    tenantId
            );
        } else if (savedGoodsReceipt.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
            // Üretim partisinden mal girişi için farklı bir işlem türü veya mantık
            // Örnek: Üretimden Mamul Stok Girişi gibi bir işlem.
            transactionService.createInternalTransaction( // Yeni bir metot varsayımı
                    savedGoodsReceipt.getSourceId(), // productionBatchId'yi tutuyor
                    Transaction.TransactionType.DEBIT, // Stok girişi varlık artışı
                    savedGoodsReceipt.getTotalValue(),
                    "#" + savedGoodsReceipt.getReceiptNumber() + " nolu irsaliye ile üretimden fidan girişi.",
                    savedGoodsReceipt.getId(),
                    userId,
                    tenantId
            );
        }

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

            // Stok hareketi iptali
            stockService.changeStock(
                    item.getPlantId(),
                    goodsReceipt.getWarehouseId(),
                    -item.getQuantity(), // Miktar negatif olmalı
                    StockMovement.MovementType.GOODS_RECEIPT_CANCEL,
                    goodsReceipt.getId(),
                    description,
                    userId,
                    tenantId,
                    item.getUnitCost() // Unit Cost bilgisini StockMovement'a iletiyoruz
            );

            // Eğer iptal edilen mal üretim partisinden geliyorsa, üretim partisinin hasat miktarını geri al
            if (goodsReceipt.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
                ProductionBatch batch = productionBatchRepository.findById(goodsReceipt.getSourceId())
                        .filter(b -> b.getTenantId().equals(tenantId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Üretim partisi bulunamadı."));

                // Üretim partisinin mevcut miktarını geri artırma (iptal edildiği için)
                batch.setCurrentQuantity(batch.getCurrentQuantity() + item.getQuantity());
                // Hasat edilen fidan sayısını geri düşürme
                batch.setHarvestedQuantity(batch.getHarvestedQuantity() != null ? batch.getHarvestedQuantity() - item.getQuantity() : 0);

                // Partinin durumunu güncelle (geri alındığı için COMPLETED'dan HARVESTED'a dönebilir)
                // Bu kısım için daha detaylı bir iş kuralı gerekebilir
                if (batch.getHarvestedQuantity() != null && batch.getHarvestedQuantity() == 0) {
                    batch.setStatus(ProductionBatch.BatchStatus.GROWING); // Hiç hasat kalmadıysa büyüyor durumuna dön
                } else if (batch.getStatus() == ProductionBatch.BatchStatus.COMPLETED) {
                    batch.setStatus(ProductionBatch.BatchStatus.HARVESTED); // Tamamlandı durumundan kısmen hasat edildiye dön
                }

                productionBatchRepository.save(batch);
            }
        }

        // Muhasebe işlemi iptali
        if (goodsReceipt.getSourceType() == GoodsReceipt.SourceType.SUPPLIER) {
            transactionService.createSupplierTransaction(
                    goodsReceipt.getSourceId(), // sourceId artık supplierId'yi tutuyor
                    Transaction.TransactionType.DEBIT, // Alım iptali olduğu için borç kaydı
                    goodsReceipt.getTotalValue(),
                    "#" + goodsReceipt.getReceiptNumber() + " nolu irsaliyenin iptali.",
                    goodsReceipt.getId(),
                    userId,
                    tenantId
            );
        } else if (goodsReceipt.getSourceType() == GoodsReceipt.SourceType.PRODUCTION_BATCH) {
            transactionService.createInternalTransaction( // createInternalTransaction metodunun tersi
                    goodsReceipt.getSourceId(), // productionBatchId'yi tutuyor
                    Transaction.TransactionType.CREDIT, // Stok girişi iptali varlık azalması
                    goodsReceipt.getTotalValue(),
                    "#" + goodsReceipt.getReceiptNumber() + " nolu irsaliye ile üretimden fidan girişinin iptali.",
                    goodsReceipt.getId(),
                    userId,
                    tenantId
            );
        }


        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.CANCELED);
        goodsReceiptRepository.save(goodsReceipt);
    }

    // mapDtoToItem metodu kaldırıldı, çünkü mapping mantığı createGoodsReceipt metodu içine taşındı
    // private GoodsReceiptItem mapDtoToItem(ReceiptItemDto dto) {
    //     GoodsReceiptItem item = new GoodsReceiptItem();
    //     item.setPlantId(dto.getPlantId());
    //     item.setQuantity(dto.getQuantity());
    //     item.setUnitCost(dto.getUnitCost()); // purchasePrice yerine unitCost
    //     return item;
    // }
}