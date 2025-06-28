package com.fidanlik.fidanysserver.production.service;

import com.fidanlik.fidanysserver.fidan.model.*;
import com.fidanlik.fidanysserver.fidan.repository.*;
import com.fidanlik.fidanysserver.production.model.ProductionBatch;
import com.fidanlik.fidanysserver.production.repository.ProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductionBatchService {

    private final ProductionBatchRepository productionBatchRepository;
    private final PlantTypeRepository plantTypeRepository;
    private final PlantVarietyRepository plantVarietyRepository;
    private final RootstockRepository rootstockRepository;
    private final PlantSizeRepository plantSizeRepository;
    private final PlantAgeRepository plantAgeRepository;
    private final LandRepository landRepository;

    public ProductionBatch createProductionBatch(ProductionBatch productionBatch, String tenantId) {
        // Parti adı benzersiz mi kontrol et
        if (productionBatchRepository.findByNameAndTenantId(productionBatch.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu parti adı bu şirkette zaten mevcut.");
        }

        // Fidan kimliği referanslarını doğrula ve DBRef objelerini set et
        validateAndSetPlantReferences(productionBatch, tenantId);

        productionBatch.setTenantId(tenantId);
        productionBatch.setCurrentPlantQuantity(productionBatch.getInitialPlantQuantity()); // Başlangıç adedi, mevcut adede atanır
        productionBatch.setCurrentCostPool(BigDecimal.ZERO); // Maliyet havuzu sıfır başlar

        return productionBatchRepository.save(productionBatch);
    }

    public List<ProductionBatch> getAllProductionBatchesByTenant(String tenantId) {
        List<ProductionBatch> batches = productionBatchRepository.findAllByTenantId(tenantId);
        // DBRef ile otomatik doldurulan alanlar için ek kontrol veya manuel doldurma
        batches.forEach(batch -> {
            plantTypeRepository.findById(batch.getPlantTypeId()).ifPresent(batch::setPlantType);
            plantVarietyRepository.findById(batch.getPlantVarietyId()).ifPresent(batch::setPlantVariety);
            rootstockRepository.findById(batch.getRootstockId()).ifPresent(batch::setRootstock);
            plantSizeRepository.findById(batch.getPlantSizeId()).ifPresent(batch::setPlantSize);
            plantAgeRepository.findById(batch.getPlantAgeId()).ifPresent(batch::setPlantAge);
            landRepository.findById(batch.getLandId()).ifPresent(batch::setLand);
        });
        return batches;
    }

    public ProductionBatch updateProductionBatch(String id, ProductionBatch updatedDetails, String tenantId) {
        ProductionBatch existingBatch = productionBatchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek üretim partisi bulunamadı."));

        if (!existingBatch.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin üretim partisini güncellemeye yetkiniz yok.");
        }

        // İsim değişirse benzersizlik kontrolü
        if (!existingBatch.getName().equals(updatedDetails.getName())) {
            if (productionBatchRepository.findByNameAndTenantId(updatedDetails.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu parti adı bu şirkette zaten mevcut.");
            }
            existingBatch.setName(updatedDetails.getName());
        }

        // Fidan kimliği referansları değişmişse doğrula ve DBRef objelerini set et
        // Buradaki kontrol, sadece ID'ler değiştiğinde tetiklenmeli
        if (!existingBatch.getPlantTypeId().equals(updatedDetails.getPlantTypeId()) ||
                !existingBatch.getPlantVarietyId().equals(updatedDetails.getPlantVarietyId()) ||
                !existingBatch.getRootstockId().equals(updatedDetails.getRootstockId()) ||
                !existingBatch.getPlantSizeId().equals(updatedDetails.getPlantSizeId()) ||
                !existingBatch.getPlantAgeId().equals(updatedDetails.getPlantAgeId()) ||
                !existingBatch.getLandId().equals(updatedDetails.getLandId())) {

            validateAndSetPlantReferences(updatedDetails, tenantId); // Güncel detayları doğrula ve DBRef'leri set et
            existingBatch.setPlantTypeId(updatedDetails.getPlantTypeId());
            existingBatch.setPlantVarietyId(updatedDetails.getPlantVarietyId());
            existingBatch.setRootstockId(updatedDetails.getRootstockId());
            existingBatch.setPlantSizeId(updatedDetails.getPlantSizeId());
            existingBatch.setPlantAgeId(updatedDetails.getPlantAgeId());
            existingBatch.setLandId(updatedDetails.getLandId());

            // DBRef objelerini de güncelle
            existingBatch.setPlantType(updatedDetails.getPlantType());
            existingBatch.setPlantVariety(updatedDetails.getPlantVariety());
            existingBatch.setRootstock(updatedDetails.getRootstock());
            existingBatch.setPlantSize(updatedDetails.getPlantSize());
            existingBatch.setPlantAge(updatedDetails.getPlantAge());
            existingBatch.setLand(updatedDetails.getLand());
        }

        // Doğum tarihi, başlangıç adedi güncellenebilir
        existingBatch.setBirthDate(updatedDetails.getBirthDate());
        existingBatch.setInitialPlantQuantity(updatedDetails.getInitialPlantQuantity());
        // currentPlantQuantity ve currentCostPool bu service metodu ile doğrudan güncellenmez,
        // ilgili diğer operasyonlar (gider ekleme, fire düşme) tarafından yönetilir.
        // Eğer client tarafından doğrudan gelen bir güncelleme ise, bu alana burada dikkat edilmeli.
        // Şimdilik sadece initialPlantQuantity'yi güncelleyelim.
        existingBatch.setCurrentPlantQuantity(updatedDetails.getCurrentPlantQuantity());
        existingBatch.setCurrentCostPool(updatedDetails.getCurrentCostPool());

        return productionBatchRepository.save(existingBatch);
    }

    public void deleteProductionBatch(String id, String tenantId) {
        ProductionBatch batchToDelete = productionBatchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek üretim partisi bulunamadı."));

        if (!batchToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin üretim partisini silmeye yetkiniz yok.");
        }

        // TODO: Bu partiye bağlı stoklar veya giderler varsa silmeyi engellemek için bir kontrol eklenebilir.
        // Örneğin: stockRepository.countByProductionBatchId(id) > 0 gibi.

        productionBatchRepository.delete(batchToDelete);
    }

    // Ortak doğrulama metodu
    private void validateAndSetPlantReferences(ProductionBatch productionBatch, String tenantId) {
        // PlantType
        Optional<PlantType> plantTypeOptional = plantTypeRepository.findById(productionBatch.getPlantTypeId());
        if (plantTypeOptional.isEmpty() || !plantTypeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan türü.");
        }
        productionBatch.setPlantType(plantTypeOptional.get());

        // PlantVariety
        Optional<PlantVariety> plantVarietyOptional = plantVarietyRepository.findById(productionBatch.getPlantVarietyId());
        if (plantVarietyOptional.isEmpty() || !plantVarietyOptional.get().getTenantId().equals(tenantId) || !plantVarietyOptional.get().getPlantTypeId().equals(productionBatch.getPlantTypeId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan çeşidi, veya tür ile uyuşmuyor.");
        }
        productionBatch.setPlantVariety(plantVarietyOptional.get());

        // Rootstock
        Optional<Rootstock> rootstockOptional = rootstockRepository.findById(productionBatch.getRootstockId());
        if (rootstockOptional.isEmpty() || !rootstockOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait anaç.");
        }
        productionBatch.setRootstock(rootstockOptional.get());

        // PlantSize
        Optional<PlantSize> plantSizeOptional = plantSizeRepository.findById(productionBatch.getPlantSizeId());
        if (plantSizeOptional.isEmpty() || !plantSizeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan boyu.");
        }
        productionBatch.setPlantSize(plantSizeOptional.get());

        // PlantAge
        Optional<PlantAge> plantAgeOptional = plantAgeRepository.findById(productionBatch.getPlantAgeId());
        if (plantAgeOptional.isEmpty() || !plantAgeOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait fidan yaşı.");
        }
        productionBatch.setPlantAge(plantAgeOptional.get());

        // Land
        Optional<Land> landOptional = landRepository.findById(productionBatch.getLandId());
        if (landOptional.isEmpty() || !landOptional.get().getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz veya başka şirkete ait arazi.");
        }
        productionBatch.setLand(landOptional.get());
    }
}