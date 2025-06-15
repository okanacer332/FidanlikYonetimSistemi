package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.PlantType; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.model.PlantVariety; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.repository.PlantTypeRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.repository.PlantVarietyRepository; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlantVarietyService {

    private final PlantVarietyRepository plantVarietyRepository;
    private final PlantTypeRepository plantTypeRepository;

    // Fidan Çeşidi Oluşturma
    public PlantVariety createPlantVariety(PlantVariety plantVariety, String tenantId) {
        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et
        if (plantVariety.getPlantTypeId() == null || plantVariety.getPlantTypeId().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fidan Türü ID'si eksik.");
        }
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantVariety.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan türü.");
        }

        // Aynı tenant ve PlantType altında aynı isimde çeşit var mı kontrol et
        if (plantVarietyRepository.findByNameAndPlantTypeIdAndTenantId(plantVariety.getName(), plantVariety.getPlantTypeId(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan çeşidi adı bu fidan türü altında bu şirkette zaten mevcut.");
        }

        plantVariety.setTenantId(tenantId);
        plantVariety.setPlantType(plantTypeOptional.get()); // DBRef için PlantType objesini set et
        return plantVarietyRepository.save(plantVariety);
    }

    // Tüm Fidan Çeşitlerini Listeleme (Tenant bazında)
    public List<PlantVariety> getAllPlantVarietiesByTenant(String tenantId) {
        List<PlantVariety> plantVarieties = plantVarietyRepository.findAllByTenantId(tenantId);
        // DBRef ile çekilen PlantType objelerinin null olup olmadığını kontrol et ve doldur
        plantVarieties.forEach(pv -> {
            if (pv.getPlantType() == null && pv.getPlantTypeId() != null) {
                plantTypeRepository.findById(pv.getPlantTypeId()).ifPresent(pv::setPlantType);
            }
        });
        return plantVarieties;
    }

    // Belirli bir Fidan Türüne ait Çeşitleri Listeleme (Tenant bazında)
    public List<PlantVariety> getPlantVarietiesByPlantTypeAndTenant(String plantTypeId, String tenantId) {
        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantTypeId);
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan türü.");
        }

        List<PlantVariety> plantVarieties = plantVarietyRepository.findAllByPlantTypeIdAndTenantId(plantTypeId, tenantId);
        plantVarieties.forEach(pv -> {
            if (pv.getPlantType() == null && pv.getPlantTypeId() != null) {
                plantTypeRepository.findById(pv.getPlantTypeId()).ifPresent(pv::setPlantType);
            }
        });
        return plantVarieties;
    }

    // Fidan Çeşidi Güncelleme
    public PlantVariety updatePlantVariety(String id, PlantVariety plantVariety, String tenantId) {
        Optional<PlantVariety> existingPlantVarietyOptional = plantVarietyRepository.findById(id);
        if (existingPlantVarietyOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek fidan çeşidi bulunamadı.");
        }
        PlantVariety existingPlantVariety = existingPlantVarietyOptional.get();

        if (!existingPlantVariety.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan çeşidini güncellemeye yetkiniz yok.");
        }

        // İlişkili PlantType'ın varlığını ve tenant'a ait olduğunu kontrol et
        if (plantVariety.getPlantTypeId() == null || plantVariety.getPlantTypeId().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fidan Türü ID'si eksik.");
        }
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plantVariety.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan türü.");
        }

        // İsim veya PlantType değişikliği varsa benzersizlik kontrolü
        if (!existingPlantVariety.getName().equals(plantVariety.getName()) || !existingPlantVariety.getPlantTypeId().equals(plantVariety.getPlantTypeId())) {
            if (plantVarietyRepository.findByNameAndPlantTypeIdAndTenantId(plantVariety.getName(), plantVariety.getPlantTypeId(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan çeşidi adı bu fidan türü altında bu şirkette zaten mevcut.");
            }
        }

        existingPlantVariety.setName(plantVariety.getName());
        existingPlantVariety.setPlantTypeId(plantVariety.getPlantTypeId());
        existingPlantVariety.setPlantType(plantTypeOptional.get()); // Güncel PlantType objesini set et

        return plantVarietyRepository.save(existingPlantVariety);
    }

    // Fidan Çeşidi Silme
    public void deletePlantVariety(String id, String tenantId) {
        Optional<PlantVariety> existingPlantVarietyOptional = plantVarietyRepository.findById(id);
        if (existingPlantVarietyOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek fidan çeşidi bulunamadı.");
        }
        PlantVariety existingPlantVariety = existingPlantVarietyOptional.get();

        if (!existingPlantVariety.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan çeşidini silmeye yetkiniz yok.");
        }

        plantVarietyRepository.delete(existingPlantVariety);
    }
}