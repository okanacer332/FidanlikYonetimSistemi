package com.fidanlik.fidanysserver.production.service;

import com.fidanlik.fidanysserver.fidan.repository.PlantRepository;
import com.fidanlik.fidanysserver.production.dto.ProductionBatchUpdateRequest;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository productionBatchRepository;
    private final StockRepository stockRepository;
    private final StockService stockService;
    private final PlantRepository plantRepository;

    public List<ProductionBatch> getAllBatches(String tenantId) {
        List<ProductionBatch> batches = productionBatchRepository.findAllByTenantId(tenantId);
        return batches.stream().peek(this::enrichBatchData).collect(Collectors.toList());
    }

    public Optional<ProductionBatch> getBatchById(String id, String tenantId) {
        Optional<ProductionBatch> batchOpt = productionBatchRepository.findById(id);
        if (batchOpt.isPresent()) {
            if (!batchOpt.get().getTenantId().equals(tenantId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu partiye erişim yetkiniz yok.");
            }
            enrichBatchData(batchOpt.get()); // Detay görüntülenirken de veriyi zenginleştir
        }
        return batchOpt;
    }

    @Transactional
    public ProductionBatch recordWastage(String batchId, WastageRecordRequest request, String userId, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        int wastedQuantity = request.getQuantity();
        if (wastedQuantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zayiat miktarı 0'dan büyük olmalıdır.");
        }
        if (wastedQuantity > batch.getCurrentQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zayiat miktarı, partideki mevcut fidan sayısından fazla olamaz. Mevcut: " + batch.getCurrentQuantity());
        }

        Stock stock = stockRepository.findByProductionBatchIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Bu partiye ait stok kaydı bulunamadı. Veri tutarsızlığı olabilir."));

        String description = "Zayiat Kaydı - Parti: " + batch.getBatchName() + (request.getReason() != null ? " - Sebep: " + request.getReason() : "");
        stockService.changeStock(
                batch.getPlantId(),
                stock.getWarehouseId(),
                -wastedQuantity,
                StockMovement.MovementType.WASTAGE,
                batch.getId(),
                description,
                userId,
                tenantId,
                stock.getType(),
                batch.getId()
        );

        batch.setCurrentQuantity(batch.getCurrentQuantity() - wastedQuantity);

        return productionBatchRepository.save(batch);
    }

    // --- YENİ EKLENEN UPDATE METODU ---
    @Transactional
    public ProductionBatch updateBatch(String batchId, ProductionBatchUpdateRequest request, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        batch.setBatchName(request.getBatchName());

        return productionBatchRepository.save(batch);
    }

    // --- YENİ EKLENEN DELETE METODU ---
    @Transactional
    public void deleteBatch(String batchId, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        // İleride bu partiye ait stok hareketleri, giderler vb. varsa silme işlemi engellenebilir.
        // Şimdilik, bu partiye ait ana stok kaydını da siliyoruz.
        stockRepository.findByProductionBatchIdAndTenantId(batchId, tenantId).ifPresent(stockRepository::delete);

        productionBatchRepository.delete(batch);
    }

    // --- Yardımcı Metod ---
    private void enrichBatchData(ProductionBatch batch) {
        plantRepository.findById(batch.getPlantId()).ifPresent(plant -> {
            String plantName = plant.getPlantType().getName() + " - " + plant.getPlantVariety().getName();
            batch.setPlantName(plantName);
        });
        batch.setBatchCode(batch.getBatchName());
    }
}