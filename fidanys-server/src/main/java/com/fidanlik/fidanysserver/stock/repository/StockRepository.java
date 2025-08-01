// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/stock/repository/StockRepository.java
package com.fidanlik.fidanysserver.stock.repository;

import com.fidanlik.fidanysserver.stock.model.Stock;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends MongoRepository<Stock, String> {
    Optional<Stock> findByPlantIdAndWarehouseIdAndTenantId(String plantId, String warehouseId, String tenantId);
    List<Stock> findAllByWarehouseIdAndTenantId(String warehouseId, String tenantId);
    List<Stock> findAllByTenantId(String tenantId);
}