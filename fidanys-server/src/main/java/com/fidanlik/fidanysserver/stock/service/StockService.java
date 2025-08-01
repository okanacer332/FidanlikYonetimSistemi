package com.fidanlik.fidanysserver.stock.service;

import com.fidanlik.fidanysserver.common.exception.InsufficientStockException; // YENİ IMPORT
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.repository.StockMovementRepository;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public void changeStock(String plantId, String warehouseId, int quantity, StockMovement.MovementType type, String relatedDocumentId, String description, String userId, String tenantId) {

        // Stok düşürme işlemi ise, mevcut stok yeterli mi diye kontrol et.
        if (quantity < 0) {
            Stock currentStock = stockRepository.findByPlantIdAndWarehouseIdAndTenantId(plantId, warehouseId, tenantId)
                    .orElse(null);

            if (currentStock == null || currentStock.getQuantity() < Math.abs(quantity)) {
                // DEĞİŞİKLİK: ResponseStatusException yerine kendi özel hatamızı fırlatıyoruz.
                throw new InsufficientStockException("Yetersiz stok. İstenen: " + Math.abs(quantity) + ", Mevcut: " + (currentStock != null ? currentStock.getQuantity() : 0));
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