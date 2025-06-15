package com.fidanlik.fidanysserver.fidan.service;

import com.fidanlik.fidanysserver.fidan.model.Rootstock; // Yeni paket yolu
import com.fidanlik.fidanysserver.fidan.repository.RootstockRepository; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RootstockService {

    private final RootstockRepository rootstockRepository;

    // Anaç Oluşturma
    public Rootstock createRootstock(Rootstock rootstock, String tenantId) {
        if (rootstockRepository.findByNameAndTenantId(rootstock.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu anaç adı bu şirkette zaten mevcut.");
        }
        rootstock.setTenantId(tenantId);
        return rootstockRepository.save(rootstock);
    }

    // Tüm Anaçları Listeleme
    public List<Rootstock> getAllRootstocksByTenant(String tenantId) {
        return rootstockRepository.findAllByTenantId(tenantId);
    }

    // Anaç Güncelleme
    public Rootstock updateRootstock(String id, Rootstock rootstock, String tenantId) {
        Optional<Rootstock> existingRootstockOptional = rootstockRepository.findById(id);
        if (existingRootstockOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek anaç bulunamadı.");
        }
        Rootstock existingRootstock = existingRootstockOptional.get();

        if (!existingRootstock.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin anacını güncellemeye yetkiniz yok.");
        }

        if (!existingRootstock.getName().equals(rootstock.getName())) {
            if (rootstockRepository.findByNameAndTenantId(rootstock.getName(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu anaç adı bu şirkette zaten mevcut.");
            }
        }
        existingRootstock.setName(rootstock.getName());
        return rootstockRepository.save(existingRootstock);
    }

    // Anaç Silme
    public void deleteRootstock(String id, String tenantId) {
        Optional<Rootstock> existingRootstockOptional = rootstockRepository.findById(id);
        if (existingRootstockOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek anaç bulunamadı.");
        }
        Rootstock existingRootstock = existingRootstockOptional.get();

        if (!existingRootstock.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin anacını silmeye yetkiniz yok.");
        }

        rootstockRepository.delete(existingRootstock);
    }
}