package com.fidanlik.fidanysserver.production.service;

import com.fidanlik.fidanysserver.production.dto.WastageRecordRequest;
import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import com.fidanlik.fidanysserver.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository productionBatchRepository;
    private final StockRepository stockRepository; // YENİ BAĞIMLILIK
    private final StockService stockService;       // YENİ BAĞIMLILIK

    public List<ProductionBatch> getAllBatches(String tenantId) {
        return productionBatchRepository.findAllByTenantId(tenantId);
    }

    public Optional<ProductionBatch> getBatchById(String id, String tenantId) {
        Optional<ProductionBatch> batch = productionBatchRepository.findById(id);
        if (batch.isPresent() && !batch.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu partiye erişim yetkiniz yok.");
        }
        return batch;
    }

    // --- YENİ METOT ---
    @Transactional
    public ProductionBatch recordWastage(String batchId, WastageRecordRequest request, String userId, String tenantId) {
        // 1. Partiyi bul ve doğrula
        ProductionBatch batch = productionBatchRepository.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        int wastedQuantity = request.getQuantity();
        if (wastedQuantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zayiat miktarı 0'dan büyük olmalıdır.");
        }
        if (wastedQuantity > batch.getCurrentQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zayiat miktarı, partideki mevcut fidan sayısından fazla olamaz. Mevcut: " + batch.getCurrentQuantity());
        }

        // 2. Partiye bağlı ana stok kaydını bul
        Stock stock = stockRepository.findByProductionBatchIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Bu partiye ait stok kaydı bulunamadı. Veri tutarsızlığı olabilir."));

        // 3. Ana stoktan düş
        String description = "Zayiat Kaydı - Parti: " + batch.getBatchName() + (request.getReason() != null ? " - Sebep: " + request.getReason() : "");
        stockService.changeStock(
                batch.getPlantId(),
                stock.getWarehouseId(),
                -wastedQuantity, // Stoktan düşüleceği için negatif
                StockMovement.MovementType.WASTAGE,
                batch.getId(),
                description,
                userId,
                tenantId,
                stock.getType(), // Stok tipi (IN_PRODUCTION)
                batch.getId()
        );

        // 4. Parti miktarını güncelle
        batch.setCurrentQuantity(batch.getCurrentQuantity() - wastedQuantity);

        return productionBatchRepository.save(batch);
    }
}