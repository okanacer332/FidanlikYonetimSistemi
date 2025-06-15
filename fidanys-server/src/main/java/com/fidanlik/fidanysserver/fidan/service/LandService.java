package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.Land;
import com.fidanlik.fidanysserver.fidan.repository.LandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LandService {

    private final LandRepository landRepository;

    // Arazi Oluşturma
    public Land createLand(Land land, String tenantId) {
        if (landRepository.findByNameAndTenantId(land.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu arazi adı bu şirkette zaten mevcut.");
        }
        land.setTenantId(tenantId);
        return landRepository.save(land);
    }

    // Tüm Arazileri Listeleme
    public List<Land> getAllLandsByTenant(String tenantId) {
        return landRepository.findAllByTenantId(tenantId);
    }

    // Arazi Güncelleme
    public Land updateLand(String id, Land land, String tenantId) {
        Optional<Land> existingLandOptional = landRepository.findById(id);
        if (existingLandOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek arazi bulunamadı.");
        }
        Land existingLand = existingLandOptional.get();

        if (!existingLand.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin arazisini güncellemeye yetkiniz yok.");
        }

        if (!existingLand.getName().equals(land.getName())) {
            if (landRepository.findByNameAndTenantId(land.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu arazi adı bu şirkette zaten mevcut.");
            }
        }
        existingLand.setName(land.getName());
        existingLand.setLocation(land.getLocation()); // Konum bilgisini de güncelleyebiliriz
        return landRepository.save(existingLand);
    }

    // Arazi Silme
    public void deleteLand(String id, String tenantId) {
        Optional<Land> existingLandOptional = landRepository.findById(id);
        if (existingLandOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek arazi bulunamadı.");
        }
        Land existingLand = existingLandOptional.get();

        if (!existingLand.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin arazisini silmeye yetkiniz yok.");
        }

        landRepository.delete(existingLand);
    }
}