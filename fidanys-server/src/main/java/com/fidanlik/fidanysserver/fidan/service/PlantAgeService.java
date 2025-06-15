package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.PlantAge;
import com.fidanlik.fidanysserver.fidan.repository.PlantAgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlantAgeService {

    private final PlantAgeRepository plantAgeRepository;

    // Fidan Yaşı Oluşturma
    public PlantAge createPlantAge(PlantAge plantAge, String tenantId) {
        if (plantAgeRepository.findByNameAndTenantId(plantAge.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan yaşı adı bu şirkette zaten mevcut.");
        }
        plantAge.setTenantId(tenantId);
        return plantAgeRepository.save(plantAge);
    }

    // Tüm Fidan Yaşlarını Listeleme
    public List<PlantAge> getAllPlantAgesByTenant(String tenantId) {
        return plantAgeRepository.findAllByTenantId(tenantId);
    }

    // Fidan Yaşı Güncelleme
    public PlantAge updatePlantAge(String id, PlantAge plantAge, String tenantId) {
        Optional<PlantAge> existingPlantAgeOptional = plantAgeRepository.findById(id);
        if (existingPlantAgeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek fidan yaşı bulunamadı.");
        }
        PlantAge existingPlantAge = existingPlantAgeOptional.get();

        if (!existingPlantAge.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan yaşını güncellemeye yetkiniz yok.");
        }

        if (!existingPlantAge.getName().equals(plantAge.getName())) {
            if (plantAgeRepository.findByNameAndTenantId(plantAge.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan yaşı adı bu şirkette zaten mevcut.");
            }
        }
        existingPlantAge.setName(plantAge.getName());
        return plantAgeRepository.save(existingPlantAge);
    }

    // Fidan Yaşı Silme
    public void deletePlantAge(String id, String tenantId) {
        Optional<PlantAge> existingPlantAgeOptional = plantAgeRepository.findById(id);
        if (existingPlantAgeOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek fidan yaşı bulunamadı.");
        }
        PlantAge existingPlantAge = existingPlantAgeOptional.get();

        if (!existingPlantAge.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan yaşını silmeye yetkiniz yok.");
        }

        plantAgeRepository.delete(existingPlantAge);
    }
}