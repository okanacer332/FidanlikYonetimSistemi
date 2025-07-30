package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.PlantType;
import com.fidanlik.fidanysserver.fidan.model.PlantVariety;
import com.fidanlik.fidanysserver.fidan.model.ProductionBatch;
import com.fidanlik.fidanysserver.fidan.repository.PlantTypeRepository;
import com.fidanlik.fidanysserver.fidan.repository.PlantVarietyRepository;
import com.fidanlik.fidanysserver.fidan.repository.ProductionBatchRepository;
import com.fidanlik.fidanysserver.common.inflation.InflationCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository productionBatchRepository;
    private final PlantTypeRepository plantTypeRepository;
    private final PlantVarietyRepository plantVarietyRepository;
    private final InflationCalculationService inflationCalculationService;

    // Yeni Üretim Partisi Oluşturma
    @Transactional
    public ProductionBatch createProductionBatch(ProductionBatch batch, String tenantId) {
        PlantType plantType = plantTypeRepository.findById(batch.getPlantTypeId())
                .filter(pt -> pt.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan türü ID'si."));

        PlantVariety plantVariety = plantVarietyRepository.findById(batch.getPlantVarietyId())
                .filter(pv -> pv.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz fidan çeşidi ID'si."));

        batch.setTenantId(tenantId);

        if (batch.getCostPool() == null) {
            batch.setCostPool(BigDecimal.ZERO);
        }
        if (batch.getInflationAdjustedCostPool() == null) {
            batch.setInflationAdjustedCostPool(BigDecimal.ZERO);
        }
        if (batch.getHarvestedQuantity() == null) { // Bu null kontrolü Integer için geçerlidir, int için değil.
            batch.setHarvestedQuantity(0); // int olduğu için varsayılan 0'dır, ancak eksplisit olarak atanabilir.
        }
        // currentQuantity int olduğu için null olamaz, başlangıçta initialQuantity'e eşitleyelim
        batch.setCurrentQuantity(batch.getInitialQuantity());

        if (batch.getStatus() == null) {
            batch.setStatus(ProductionBatch.BatchStatus.CREATED);
        }

        if (batch.getBatchCode() == null || batch.getBatchCode().isEmpty()) {
            String typeCode = plantType.getName().substring(0, Math.min(plantType.getName().length(), 5)).toUpperCase();
            String yearMonth = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMM"));
            String uniqueSuffix = String.valueOf(System.currentTimeMillis()).substring(8);
            batch.setBatchCode("PRD-" + yearMonth + "-" + typeCode + "-" + uniqueSuffix);
        } else {
            if (productionBatchRepository.findByBatchCodeAndTenantId(batch.getBatchCode(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu parti kodu zaten mevcut.");
            }
        }

        return productionBatchRepository.save(batch);
    }

    // Tüm Üretim Partilerini Getirme
    public List<ProductionBatch> getAllProductionBatches(String tenantId) {
        return productionBatchRepository.findAllByTenantId(tenantId);
    }

    // ID'ye göre Üretim Partisi Getirme
    public Optional<ProductionBatch> getProductionBatchById(String id, String tenantId) {
        return productionBatchRepository.findById(id)
                .filter(batch -> batch.getTenantId().equals(tenantId));
    }

    // Üretim Partisi Güncelleme (Maliyet havuzu, miktar vb.)
    @Transactional
    public ProductionBatch updateProductionBatchCost(String batchId, BigDecimal amountToAdd, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findById(batchId)
                .filter(b -> b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        if (batch.getCostPool() == null) {
            batch.setCostPool(BigDecimal.ZERO);
        }
        batch.setCostPool(batch.getCostPool().add(amountToAdd));
        batch.setLastCostUpdateDate(LocalDate.now());

        return productionBatchRepository.save(batch);
    }

    // Üretim Partisi Miktarını Güncelleme (Hasat veya kayıp durumunda)
    @Transactional
    public ProductionBatch updateProductionBatchQuantity(String batchId, int quantityChange, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findById(batchId)
                .filter(b -> b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        batch.setCurrentQuantity(batch.getCurrentQuantity() + quantityChange);

        if (quantityChange > 0) {
            batch.setHarvestedQuantity(batch.getHarvestedQuantity() + quantityChange);
        }

        if (batch.getStatus() == ProductionBatch.BatchStatus.CREATED || batch.getStatus() == ProductionBatch.BatchStatus.GROWING) {
            batch.setStatus(ProductionBatch.BatchStatus.GROWING);
        }
        if (batch.getHarvestedQuantity() > 0 && batch.getStatus() != ProductionBatch.BatchStatus.COMPLETED) {
            batch.setStatus(ProductionBatch.BatchStatus.HARVESTED);
        }
        if (batch.getExpectedHarvestQuantity() != null && batch.getHarvestedQuantity() >= batch.getExpectedHarvestQuantity()) {
            batch.setStatus(ProductionBatch.BatchStatus.COMPLETED);
        }


        return productionBatchRepository.save(batch);
    }

    // Enflasyon Düzeltmeli Maliyet Havuzunu Hesapla ve Güncelle
    @Transactional
    public ProductionBatch calculateAndSetInflationAdjustedCost(String batchId, String tenantId) {
        ProductionBatch batch = productionBatchRepository.findById(batchId)
                .filter(b -> b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Üretim partisi bulunamadı."));

        if (batch.getCostPool() != null && batch.getCostPool().compareTo(BigDecimal.ZERO) > 0) {
            // Metot çağrısı calculateAdjustedAmount yerine calculateRealValue olarak düzeltildi
            BigDecimal adjustedCost = inflationCalculationService.calculateRealValue(
                    batch.getCostPool(),
                    batch.getLastCostUpdateDate() != null ? batch.getLastCostUpdateDate() : batch.getStartDate(),
                    LocalDate.now()
            );
            batch.setInflationAdjustedCostPool(adjustedCost);
        } else {
            batch.setInflationAdjustedCostPool(BigDecimal.ZERO);
        }

        return productionBatchRepository.save(batch);
    }
}