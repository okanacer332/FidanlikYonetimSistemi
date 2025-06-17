// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/repository/StockMovementRepository.java
package com.fidanlik.fidanysserver.stock.repository;

import com.fidanlik.fidanysserver.stock.model.StockMovement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface StockMovementRepository extends MongoRepository<StockMovement, String> {
    List<StockMovement> findAllByPlantIdAndTenantIdOrderByTimestampDesc(String plantId, String tenantId);
    List<StockMovement> findAllByWarehouseIdAndTenantIdOrderByTimestampDesc(String warehouseId, String tenantId);
}