package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.PlantSize;
import com.fidanlik.fidanysserver.fidan.repository.PlantSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlantSizeService {

    private final PlantSizeRepository plantSizeRepository;

    // Fidan Boyu Oluşturma
    public PlantSize createPlantSize(PlantSize plantSize, String tenantId) {
        if (plantSizeRepository.findByNameAndTenantId(plantSize.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan boyu adı bu şirkette zaten mevcut.");
        }
        plantSize.setTenantId(tenantId);
        return plantSizeRepository.save(plantSize);
    }

    // Tüm Fidan Boylarını Listeleme
    public List<PlantSize> getAllPlantSizesByTenant(String tenantId) {
        return plantSizeRepository.findAllByTenantId(tenantId);
    }

    // Fidan Boyu Güncelleme
    public PlantSize updatePlantSize(String id, PlantSize plantSize, String tenantId) {
        Optional<PlantSize> existingPlantSizeOptional = plantSizeRepository.findById(id);
        if (existingPlantSizeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek fidan boyu bulunamadı.");
        }
        PlantSize existingPlantSize = existingPlantSizeOptional.get();

        if (!existingPlantSize.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan boyunu güncellemeye yetkiniz yok.");
        }

        if (!existingPlantSize.getName().equals(plantSize.getName())) {
            if (plantSizeRepository.findByNameAndTenantId(plantSize.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan boyu adı bu şirkette zaten mevcut.");
            }
        }
        existingPlantSize.setName(plantSize.getName());
        return plantSizeRepository.save(existingPlantSize);
    }

    // Fidan Boyu Silme
    public void deletePlantSize(String id, String tenantId) {
        Optional<PlantSize> existingPlantSizeOptional = plantSizeRepository.findById(id);
        if (existingPlantSizeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek fidan boyu bulunamadı.");
        }
        PlantSize existingPlantSize = existingPlantSizeOptional.get();

        if (!existingPlantSize.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan boyunu silmeye yetkiniz yok.");
        }

        plantSizeRepository.delete(existingPlantSize);
    }
}