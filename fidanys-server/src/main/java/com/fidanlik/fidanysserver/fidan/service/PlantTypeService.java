package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.PlantType;
import com.fidanlik.fidanysserver.fidan.repository.PlantTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlantTypeService {

    private final PlantTypeRepository plantTypeRepository;

    // Fidan Türü Oluşturma
    public PlantType createPlantType(PlantType plantType, String tenantId) {
        if (plantTypeRepository.findByNameAndTenantId(plantType.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan türü adı bu şirkette zaten mevcut.");
        }
        plantType.setTenantId(tenantId);
        return plantTypeRepository.save(plantType);
    }

    // Tüm Fidan Türlerini Listeleme
    public List<PlantType> getAllPlantTypesByTenant(String tenantId) {
        return plantTypeRepository.findAllByTenantId(tenantId);
    }

    // Fidan Türü Güncelleme
    public PlantType updatePlantType(String id, PlantType plantType, String tenantId) {
        Optional<PlantType> existingPlantTypeOptional = plantTypeRepository.findById(id);
        if (existingPlantTypeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek fidan türü bulunamadı.");
        }
        PlantType existingPlantType = existingPlantTypeOptional.get();

        if (!existingPlantType.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan türünü güncellemeye yetkiniz yok.");
        }

        // Eğer isim değiştiriliyorsa, yeni ismin başka bir kayıtta kullanılıp kullanılmadığını kontrol et
        if (!existingPlantType.getName().equals(plantType.getName())) {
            if (plantTypeRepository.findByNameAndTenantId(plantType.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan türü adı bu şirkette zaten mevcut.");
            }
        }
        existingPlantType.setName(plantType.getName());
        return plantTypeRepository.save(existingPlantType);
    }

    // Fidan Türü Silme
    public void deletePlantType(String id, String tenantId) {
        Optional<PlantType> existingPlantTypeOptional = plantTypeRepository.findById(id);
        if (existingPlantTypeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek fidan türü bulunamadı.");
        }
        PlantType existingPlantType = existingPlantTypeOptional.get();

        if (!existingPlantType.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan türünü silmeye yetkiniz yok.");
        }

        // İleride bu türe bağlı çeşitler varsa silmeyi engellemek için bir kontrol eklenebilir.
        plantTypeRepository.delete(existingPlantType);
    }
}