package com.fidanlik.fidanysserver.stock.service;

import com.fidanlik.fidanysserver.common.exception.InsufficientStockException;
import com.fidanlik.fidanysserver.production.model.ProductionBatch; // YENİ IMPORT
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository; // YENİ IMPORT
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.repository.StockMovementRepository;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // YENİ IMPORT (ResponseStatusException için, eğer geri eklersek)
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException; // YENİ IMPORT (ResponseStatusException için)

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final MongoTemplate mongoTemplate;
    private final ProductionBatchRepository productionBatchRepository; // YENİ: ProductionBatchRepository eklendi

    @Transactional
    public void changeStock(String plantId, String warehouseId, int quantity, StockMovement.MovementType type, String relatedDocumentId, String description, String userId, String tenantId, String productionBatchId) {
        // productionBatchId'nin null olup olmaması önemli, bu yüzden direkt 'String' olarak bırakıp kontrol edeceğiz.

        // Stok düşürme işlemi ise, mevcut stok yeterli mi diye kontrol et.
        if (quantity < 0) {
            Stock currentStock = stockRepository.findByPlantIdAndWarehouseIdAndTenantId(plantId, warehouseId, tenantId)
                    .orElse(null);

            if (currentStock == null || currentStock.getQuantity() < Math.abs(quantity)) {
                throw new InsufficientStockException("Yetersiz stok. İstenen: " + Math.abs(quantity) + ", Mevcut: " + (currentStock != null ? currentStock.getQuantity() : 0));
            }

            // Eğer stok düşüşü bir üretim partisinden geliyorsa (yani productionBatchId doluysa)
            // ve hareket tipi SATIŞ veya ZAYİAT ise, üretim partisindeki fidan miktarını güncelle.
            // Sadece fidan çıkışı olduğunda ProductionBatch quantity'sini etkile.
            if (productionBatchId != null && !productionBatchId.isEmpty() && (type == StockMovement.MovementType.SALE || type == StockMovement.MovementType.WASTAGE)) {
                ProductionBatch productionBatch = productionBatchRepository.findById(productionBatchId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "İlgili üretim partisi bulunamadı."));

                // Üretim partisi tenantId kontrolü
                if (!productionBatch.getTenantId().equals(tenantId)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirkete ait üretim partisini güncellemeye yetkiniz yok.");
                }

                // Fire durumunda maliyet kalanlara yükleneceği için sadece miktar düşülür.
                // Satışta da miktar düşülür, maliyet hesabı raporlama katmanında yapılacaktır.
                productionBatch.setCurrentPlantQuantity(productionBatch.getCurrentPlantQuantity() + quantity); // quantity negatif olduğu için eksiltme yapacak

                if (productionBatch.getCurrentPlantQuantity() < 0) {
                    // Bu durum normalde olmamalı, InsufficientStockException zaten atılmış olmalı
                    // veya quantity kontrolü daha kapsamlı olmalı.
                    throw new InsufficientStockException("Üretim partisindeki fidan sayısı negatif olamaz.");
                }

                productionBatchRepository.save(productionBatch);
            }
        }

        // 1. Stok Hareketini Kaydet
        StockMovement movement = new StockMovement();
        movement.setPlantId(plantId);
        movement.setWarehouseId(warehouseId);
        movement.setQuantity(quantity);
        movement.setType(type);
        movement.setRelatedDocumentId(relatedDocumentId);
        movement.setDescription(description);
        movement.setUserId(userId);
        movement.setTimestamp(LocalDateTime.now());
        movement.setTenantId(tenantId);
        movement.setProductionBatchId(productionBatchId); // YENİ: productionBatchId'yi kaydet
        stockMovementRepository.save(movement);

        // 2. Anlık Stok Miktarını Atomik Olarak Güncelle
        Query query = new Query(Criteria.where("plantId").is(plantId)
                .and("warehouseId").is(warehouseId)
                .and("tenantId").is(tenantId));

        Update update = new Update().inc("quantity", quantity);

        mongoTemplate.upsert(query, update, Stock.class);
    }

    public List<Stock> getAllStocksByTenant(String tenantId) {
        return stockRepository.findAllByTenantId(tenantId);
    }

    public List<StockMovement> getMovementsByPlant(String plantId, String tenantId) {
        return stockMovementRepository.findAllByPlantIdAndTenantIdOrderByTimestampDesc(plantId, tenantId);
    }
}