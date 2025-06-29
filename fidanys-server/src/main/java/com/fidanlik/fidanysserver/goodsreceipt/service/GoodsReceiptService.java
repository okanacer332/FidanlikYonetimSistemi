package com.fidanlik.fidanysserver.goodsreceipt.service;

import com.fidanlik.fidanysserver.accounting.model.Transaction;
import com.fidanlik.fidanysserver.accounting.service.TransactionService;
import com.fidanlik.fidanysserver.common.exception.InsufficientStockException;
import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.goodsreceipt.dto.GoodsReceiptRequest;
import com.fidanlik.fidanysserver.goodsreceipt.dto.ReceiptItemDto;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceiptItem;
import com.fidanlik.fidanysserver.goodsreceipt.repository.GoodsReceiptRepository;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.service.StockService;
import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal; // Import BigDecimal
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Transactional
    public GoodsReceipt createGoodsReceipt(GoodsReceiptRequest request, String userId, String tenantId) {
        warehouseRepository.findById(request.getWarehouseId())
                .filter(w -> w.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz depo ID'si."));
        supplierRepository.findById(request.getSupplierId())
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz tedarikçi ID'si."));

        GoodsReceipt goodsReceipt = new GoodsReceipt();
        goodsReceipt.setReceiptNumber(request.getReceiptNumber()); // getInvoiceNumber -> getReceiptNumber
        goodsReceipt.setSupplierId(request.getSupplierId());
        goodsReceipt.setWarehouseId(request.getWarehouseId());
        goodsReceipt.setUserId(userId);
        goodsReceipt.setTenantId(tenantId);
        goodsReceipt.setReceiptDate(request.getReceiptDate() != null ? request.getReceiptDate() : LocalDateTime.now()); // getReceiptDate() eklendi
        goodsReceipt.setDescription(request.getDescription()); // getDescription() eklendi
        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.COMPLETED); // Varsayılan durum

        List<GoodsReceiptItem> items = new ArrayList<>();
        BigDecimal totalValue = BigDecimal.ZERO; // double yerine BigDecimal.ZERO kullanıldı

        for (ReceiptItemDto itemDto : request.getItems()) {
            // Fidan kontrolü
            plantRepository.findById(itemDto.getPlantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan ID'si: " + itemDto.getPlantId()));

            GoodsReceiptItem item = new GoodsReceiptItem();
            item.setPlantId(itemDto.getPlantId());
            item.setQuantity(itemDto.getQuantity());
            item.setPurchasePrice(itemDto.getPurchasePrice()); // getUnitPrice -> getPurchasePrice

            // Toplam fiyat hesaplaması BigDecimal ile
            item.setTotalPrice(itemDto.getPurchasePrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()))); // BigDecimal çarpımı
            items.add(item);
            totalValue = totalValue.add(item.getTotalPrice()); // BigDecimal toplama

            // Stok Güncelleme
            stockService.changeStock(
                    itemDto.getPlantId(),
                    request.getWarehouseId(),
                    itemDto.getQuantity(),
                    StockMovement.MovementType.GOODS_RECEIPT,
                    null, // relatedDocumentId şimdilik null, savedGoodsReceipt.getId() aşağıda atanabilir.
                    "Mal Kabul: " + goodsReceipt.getReceiptNumber(), // İrsaliye numarası kullanıldı
                    userId,
                    tenantId,
                    null // productionBatchId için null geçiyoruz, çünkü mal kabul direkt üretim partisiyle ilgili değilse.
            );
        }
        goodsReceipt.setItems(items);
        goodsReceipt.setTotalValue(totalValue); // setTotalAmount -> setTotalValue

        GoodsReceipt savedGoodsReceipt = goodsReceiptRepository.save(goodsReceipt);

        // Stok hareketlerinin relatedDocumentId alanını güncelle
        // Buradaki çağrılar daha önce goodsReceipt.getId() alıyordu, ancak StockService'de ilgiliDocumentId null olarak ayarlanabiliyordu.
        // Eğer her stok hareketi kaydı için Mal Kabul ID'sini kaydetmek istiyorsak,
        // changeStock çağrısında relatedDocumentId parametresini savedGoodsReceipt.getId() olarak güncelleyebiliriz.
        // Yukarıdaki changeStock çağrısında şimdilik null bırakılmıştır.

        // Cari hesaba alacak kaydı oluşturma
        transactionService.createSupplierTransaction(
                savedGoodsReceipt.getSupplierId(),
                Transaction.TransactionType.CREDIT,
                savedGoodsReceipt.getTotalValue(), // totalAmount yerine totalValue
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
        GoodsReceipt goodsReceipt = goodsReceiptRepository.findByIdAndTenantId(receiptId, tenantId) // findByIdAndTenantId kullanıldı
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mal giriş kaydı bulunamadı."));

        if (goodsReceipt.getStatus() == GoodsReceipt.GoodsReceiptStatus.CANCELED) { // isCancelled -> getStatus == CANCELED
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kayıt zaten iptal edilmiş.");
        }

        for (GoodsReceiptItem item : goodsReceipt.getItems()) {
            String description = "İptal - İrsaliye No: " + goodsReceipt.getReceiptNumber(); // getInvoiceNumber -> getReceiptNumber
            stockService.changeStock(
                    item.getPlantId(),
                    goodsReceipt.getWarehouseId(),
                    -item.getQuantity(),
                    StockMovement.MovementType.GOODS_RECEIPT_CANCEL,
                    goodsReceipt.getId(),
                    description,
                    userId,
                    tenantId,
                    null // productionBatchId için null geçiyoruz
            );
        }

        // Cari hesaptan alacağı silme (borç kaydı)
        transactionService.createSupplierTransaction(
                goodsReceipt.getSupplierId(),
                Transaction.TransactionType.DEBIT,
                goodsReceipt.getTotalValue(), // totalAmount yerine totalValue
                "#" + goodsReceipt.getReceiptNumber() + " nolu irsaliyenin iptali.", // getInvoiceNumber -> getReceiptNumber
                goodsReceipt.getId(),
                userId,
                tenantId
        );

        goodsReceipt.setStatus(GoodsReceipt.GoodsReceiptStatus.CANCELED); // setCancelled -> setStatus
        // goodsReceipt.setCancelDate(LocalDateTime.now()); // Kaldırıldı, status enum yeterli
        // goodsReceipt.setCancelReason("Kullanıcı tarafından iptal edildi."); // Kaldırıldı
        goodsReceiptRepository.save(goodsReceipt);
    }
}