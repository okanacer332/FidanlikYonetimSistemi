package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.*;
import com.fidanlik.fidanysserver.fidan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlantService {

    private final PlantRepository plantRepository;
    private final PlantTypeRepository plantTypeRepository;
    private final PlantVarietyRepository plantVarietyRepository;
    private final RootstockRepository rootstockRepository;
    private final PlantSizeRepository plantSizeRepository;
    private final PlantAgeRepository plantAgeRepository;
    private final LandRepository landRepository;


    // Fidan Kimliği Oluşturma
    public Plant createPlant(Plant plant, String tenantId) {
        // 1. Tüm referans ID'lerinin geçerliliğini ve tenant'a ait olup olmadığını kontrol et
        validateAndSetPlantReferences(plant, tenantId);

        // 2. Aynı tenant içinde aynı kombinasyonda (Fidan Kimliği) var mı kontrol et
        if (plantRepository.findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndLandIdAndTenantId(
                plant.getPlantTypeId(), plant.getPlantVarietyId(), plant.getRootstockId(),
                plant.getPlantSizeId(), plant.getPlantAgeId(), plant.getLandId(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan kimliği bu şirkette zaten mevcut.");
        }

        plant.setTenantId(tenantId);
        return plantRepository.save(plant);
    }

    // Tüm Fidan Kimliklerini Listeleme (Tenant bazında)
    public List<Plant> getAllPlantsByTenant(String tenantId) {
        List<Plant> plants = plantRepository.findAllByTenantId(tenantId);
        // DBRef ile otomatik doldurulan alanlar için ek kontrol veya manuel doldurma
        plants.forEach(plant -> {
            plantTypeRepository.findById(plant.getPlantTypeId()).ifPresent(plant::setPlantType);
            plantVarietyRepository.findById(plant.getPlantVarietyId()).ifPresent(plant::setPlantVariety);
            rootstockRepository.findById(plant.getRootstockId()).ifPresent(plant::setRootstock);
            plantSizeRepository.findById(plant.getPlantSizeId()).ifPresent(plant::setPlantSize);
            plantAgeRepository.findById(plant.getPlantAgeId()).ifPresent(plant::setPlantAge);
            landRepository.findById(plant.getLandId()).ifPresent(plant::setLand);
        });
        return plants;
    }

    // YENİ EKLENEN METOT: Fidan türü ve çeşidine göre tek bir fidan bulma
    public Optional<Plant> getPlantByTypeIdAndVarietyId(String plantTypeId, String plantVarietyId, String tenantId) {
        // Sadece PlantType ve PlantVariety ID'sine göre arama yapıyoruz.
        // Diğer alanlar (Rootstock, PlantSize, PlantAge, Land) varsayılan olarak null veya boş olabilir.
        // Bu sorgu, bir üretim partisinden hasat yapıldığında hangi Fidan ID'sinin kullanılacağını belirlemek için en uygun olanıdır.
        return plantRepository.findFirstByPlantTypeIdAndPlantVarietyIdAndTenantId(plantTypeId, plantVarietyId, tenantId);
    }

    // Fidan Kimliği Güncelleme
    public Plant updatePlant(String id, Plant plant, String tenantId) {
        Optional<Plant> existingPlantOptional = plantRepository.findById(id);
        if (existingPlantOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek fidan kimliği bulunamadı.");
        }
        Plant existingPlant = existingPlantOptional.get();

        // Tenant kontrolü
        if (!existingPlant.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan kimliğini güncellemeye yetkiniz yok.");
        }

        // Referans ID'lerini ve geçerliliklerini kontrol et
        validateAndSetPlantReferences(plant, tenantId);


        // Kombinasyon değiştiyse benzersizlik kontrolü (güncellenen objenin kendisi hariç)
        if (!existingPlant.getPlantTypeId().equals(plant.getPlantTypeId()) ||
                !existingPlant.getPlantVarietyId().equals(plant.getPlantVarietyId()) ||
                !existingPlant.getRootstockId().equals(plant.getRootstockId()) ||
                !existingPlant.getPlantSizeId().equals(plant.getPlantSizeId()) ||
                !existingPlant.getPlantAgeId().equals(plant.getPlantAgeId()) ||
                !existingPlant.getLandId().equals(plant.getLandId())) {

            if (plantRepository.findByPlantTypeIdAndPlantVarietyIdAndRootstockIdAndPlantSizeIdAndPlantAgeIdAndLandIdAndTenantId(
                    plant.getPlantTypeId(), plant.getPlantVarietyId(), plant.getRootstockId(),
                    plant.getPlantSizeId(), plant.getPlantAgeId(), plant.getLandId(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu fidan kimliği kombinasyonu bu şirkette zaten mevcut.");
            }
        }

        // Güncel ID'leri ve DBRef'leri existingPlant objesine ata
        existingPlant.setPlantTypeId(plant.getPlantTypeId());
        existingPlant.setPlantVarietyId(plant.getPlantVarietyId());
        existingPlant.setRootstockId(plant.getRootstockId());
        existingPlant.setPlantSizeId(plant.getPlantSizeId());
        existingPlant.setPlantAgeId(plant.getPlantAgeId());
        existingPlant.setLandId(plant.getLandId());


        // DBRef'leri de güncelle
        existingPlant.setPlantType(plant.getPlantType());
        existingPlant.setPlantVariety(plant.getPlantVariety());
        existingPlant.setRootstock(plant.getRootstock());
        existingPlant.setPlantSize(plant.getPlantSize());
        existingPlant.setPlantAge(plant.getPlantAge());
        existingPlant.setLand(plant.getLand());

        return plantRepository.save(existingPlant);
    }

    // Fidan Kimliği Silme
    public void deletePlant(String id, String tenantId) {
        Optional<Plant> existingPlantOptional = plantRepository.findById(id);
        if (existingPlantOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek fidan kimliği bulunamadı.");
        }
        Plant existingPlant = existingPlantOptional.get();

        // Tenant kontrolü
        if (!existingPlant.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin fidan kimliğini silmeye yetkiniz yok.");
        }

        plantRepository.delete(existingPlant);
    }

    // Yardımcı metod: Fidan referanslarını doğrular ve set eder
    private void validateAndSetPlantReferences(Plant plant, String tenantId) {
        // PlantType
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(plant.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan türü.");
        }
        plant.setPlantType(plantTypeOptional.get());

        // PlantVariety
        Optional<PlantVariety> plantVarietyOptional = plantVarietyRepository.findById(plant.getPlantVarietyId());
        if (plantVarietyOptional.isEmpty() || !plantVarietyOptional.get().getTenantId().equals(tenantId) || !plantVarietyOptional.get().getPlantTypeId().equals(plant.getPlantTypeId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan çeşidi, veya tür ile uyuşmuyor.");
        }
        plant.setPlantVariety(plantVarietyOptional.get());

        // Rootstock
        Optional<Rootstock> rootstockOptional = rootstockRepository.findById(plant.getRootstockId());
        if (rootstockOptional.isEmpty() || !rootstockOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait anaç.");
        }
        plant.setRootstock(rootstockOptional.get());

        // PlantSize
        Optional<PlantSize> plantSizeOptional = plantSizeRepository.findById(plant.getPlantSizeId());
        if (plantSizeOptional.isEmpty() || !plantSizeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan boyu.");
        }
        plant.setPlantSize(plantSizeOptional.get());

        // PlantAge
        Optional<PlantAge> plantAgeOptional = plantAgeRepository.findById(plant.getPlantAgeId());
        if (plantAgeOptional.isEmpty() || !plantAgeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan yaşı.");
        }
        plant.setPlantAge(plantAgeOptional.get());

        // Land - Yeni eklendi
        Optional<Land> landOptional = landRepository.findById(plant.getLandId());
        if (landOptional.isEmpty() || !landOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait arazi.");
        }
        plant.setLand(landOptional.get());
    }
}