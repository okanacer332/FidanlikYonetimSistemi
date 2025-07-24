// fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/service/StockService.java
package com.fidanlik.fidanysserver.stock.service;

import com.fidanlik.fidanysserver.common.exception.InsufficientStockException;
import com.fidanlik.fidanysserver.stock.dto.StockSummaryDTO;
import com.fidanlik.fidanysserver.stock.model.Stock;
import com.fidanlik.fidanysserver.stock.model.StockMovement;
import com.fidanlik.fidanysserver.stock.repository.StockMovementRepository;
import com.fidanlik.fidanysserver.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.aggregation.LookupOperation.newLookup;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public void changeStock(String plantId, String warehouseId, int quantity, StockMovement.MovementType type, String relatedDocumentId, String description, String userId, String tenantId) {

        if (quantity < 0) {
            Stock currentStock = stockRepository.findByPlantIdAndWarehouseIdAndTenantId(plantId, warehouseId, tenantId)
                    .orElse(null);

            if (currentStock == null || currentStock.getQuantity() < Math.abs(quantity)) {
                throw new InsufficientStockException("Yetersiz stok. İstenen: " + Math.abs(quantity) + ", Mevcut: " + (currentStock != null ? currentStock.getQuantity() : 0));
            }
        }

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

        Query query = new Query(Criteria.where("plantId").is(plantId)
                .and("warehouseId").is(warehouseId)
                .and("tenantId").is(tenantId));

        Update update = new Update().inc("quantity", quantity);

        mongoTemplate.upsert(query, update, Stock.class);
    }

    public List<Stock> getAllStocksByTenant(String tenantId) {
        return stockRepository.findAllByTenantId(tenantId);
    }

    public Stock getStockByIdAndTenantId(String id, String tenantId) {
        return stockRepository.findById(id)
                .filter(stock -> stock.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Stock not found with id: " + id + " for tenant: " + tenantId));
    }

    public Optional<Stock> getStockByPlantAndWarehouse(String plantId, String warehouseId, String tenantId) {
        return stockRepository.findByPlantIdAndWarehouseIdAndTenantId(plantId, warehouseId, tenantId);
    }

    public List<StockMovement> getMovementsByPlant(String plantId, String tenantId) {
        return stockMovementRepository.findAllByPlantIdAndTenantIdOrderByTimestampDesc(plantId, tenantId);
    }

    public List<StockSummaryDTO> getStockSummary(String tenantId) {
        Aggregation aggregation = newAggregation(
                match(Criteria.where("tenantId").is(tenantId)),

                newLookup()
                        .from("plantIdentity")
                        .localField("plantId")
                        .foreignField("_id")
                        .as("plantIdentityDetails"),
                unwind("plantIdentityDetails"),

                newLookup()
                        .from("warehouse")
                        .localField("warehouseId")
                        .foreignField("_id")
                        .as("warehouseDetails"),
                unwind("warehouseDetails"),

                newLookup()
                        .from("plantType")
                        .localField("plantIdentityDetails.plantType")
                        .foreignField("_id")
                        .as("plantIdentityDetails.plantType"),
                unwind("plantIdentityDetails.plantType"),

                newLookup()
                        .from("plantVariety")
                        .localField("plantIdentityDetails.plantVariety")
                        .foreignField("_id")
                        .as("plantIdentityDetails.plantVariety"),
                unwind("plantIdentityDetails.plantVariety"),

                newLookup()
                        .from("rootstock")
                        .localField("plantIdentityDetails.rootstock")
                        .foreignField("_id")
                        .as("plantIdentityDetails.rootstock"),
                unwind("plantIdentityDetails.rootstock"),

                newLookup()
                        .from("plantSize")
                        .localField("plantIdentityDetails.plantSize")
                        .foreignField("_id")
                        .as("plantIdentityDetails.plantSize"),
                unwind("plantIdentityDetails.plantSize"),

                newLookup()
                        .from("plantAge")
                        .localField("plantIdentityDetails.plantAge")
                        .foreignField("_id")
                        .as("plantIdentityDetails.plantAge"),
                unwind("plantIdentityDetails.plantAge"),

                group(fields("plantId", "warehouseId"))
                        .sum("quantity").as("totalQuantity")
                        .first("plantIdentityDetails").as("plantIdentityDetails")
                        .first("warehouseDetails").as("warehouseDetails")
                        .first("status").as("status"),

                project()
                        .and("plantIdentityDetails._id").as("plantIdentityId")
                        .and("plantIdentityDetails.plantType.name").as("plantTypeName")
                        .and("plantIdentityDetails.plantVariety.name").as("plantVarietyName")
                        .and("plantIdentityDetails.rootstock.name").as("rootstockName")
                        .and("plantIdentityDetails.plantSize.name").as("plantSizeName")
                        .and("plantIdentityDetails.plantAge.name").as("plantAgeName")
                        .and("warehouseDetails._id").as("warehouseId")
                        .and("warehouseDetails.name").as("warehouseName")
                        .and("totalQuantity").as("totalQuantity")
                        .and("status").as("status"),

                match(Criteria.where("totalQuantity").gt(0))
        );

        AggregationResults<StockSummaryDTO> results = mongoTemplate.aggregate(
                aggregation, "stock", StockSummaryDTO.class);

        return results.getMappedResults();
    }

    // **** YENİ EKLENECEK METOT ****
    public long countAllStocks(String tenantId) {
        Query query = new Query(Criteria.where("tenantId").is(tenantId));
        return mongoTemplate.count(query, Stock.class);
    }

    // **** YENİ EKLENECEK METOT ****
    public long countLowStockPlants(String tenantId) {
        // Düşük stoklu fidanları sayan mantık
        // Örneğin, quantity < 10 olanları sayabiliriz
        Query query = new Query(Criteria.where("quantity").lt(10).and("tenantId").is(tenantId));
        return mongoTemplate.count(query, Stock.class);
    }
}