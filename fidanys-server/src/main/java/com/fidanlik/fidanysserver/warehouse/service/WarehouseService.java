// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/warehouse/service/WarehouseService.java
package com.fidanlik.fidanysserver.warehouse.service;

import com.fidanlik.fidanysserver.warehouse.model.Warehouse;
import com.fidanlik.fidanysserver.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public Warehouse createWarehouse(Warehouse warehouse, String tenantId) {
        if (warehouseRepository.findByNameAndTenantId(warehouse.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu depo adı bu şirkette zaten mevcut.");
        }
        warehouse.setTenantId(tenantId);
        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehousesByTenant(String tenantId) {
        return warehouseRepository.findAllByTenantId(tenantId);
    }

    public Warehouse updateWarehouse(String id, Warehouse warehouseDetails, String tenantId) {
        Warehouse existingWarehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek depo bulunamadı."));

        if (!existingWarehouse.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin deposunu güncellemeye yetkiniz yok.");
        }

        if (warehouseDetails.getName() != null && !existingWarehouse.getName().equals(warehouseDetails.getName())) {
            warehouseRepository.findByNameAndTenantId(warehouseDetails.getName(), tenantId).ifPresent(w -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu depo adı bu şirkette zaten mevcut.");
            });
            existingWarehouse.setName(warehouseDetails.getName());
        }

        if (warehouseDetails.getAddress() != null) {
            existingWarehouse.setAddress(warehouseDetails.getAddress());
        }

        return warehouseRepository.save(existingWarehouse);
    }

    public void deleteWarehouse(String id, String tenantId) {
        Warehouse warehouseToDelete = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek depo bulunamadı."));

        if (!warehouseToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin deposunu silmeye yetkiniz yok.");
        }

        // İleride bu depoya bağlı stoklar varsa silmeyi engellemek için bir kontrol eklenebilir.
        warehouseRepository.delete(warehouseToDelete);
    }
}