// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/supplier/service/SupplierService.java
package com.fidanlik.fidanysserver.supplier.service;

import com.fidanlik.fidanysserver.supplier.model.Supplier;
import com.fidanlik.fidanysserver.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public Supplier createSupplier(Supplier supplier, String tenantId) {
        if (supplierRepository.findByNameAndTenantId(supplier.getName(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu tedarikçi adı bu şirkette zaten mevcut.");
        }
        supplier.setTenantId(tenantId);
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliersByTenant(String tenantId) {
        return supplierRepository.findAllByTenantId(tenantId);
    }

    public Supplier updateSupplier(String id, Supplier supplierDetails, String tenantId) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek tedarikçi bulunamadı."));

        if (!existingSupplier.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin tedarikçisini güncellemeye yetkiniz yok.");
        }

        existingSupplier.setName(supplierDetails.getName());
        existingSupplier.setContactPerson(supplierDetails.getContactPerson());
        existingSupplier.setPhone(supplierDetails.getPhone());
        existingSupplier.setEmail(supplierDetails.getEmail());
        existingSupplier.setAddress(supplierDetails.getAddress());

        return supplierRepository.save(existingSupplier);
    }

    public void deleteSupplier(String id, String tenantId) {
        Supplier supplierToDelete = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek tedarikçi bulunamadı."));

        if (!supplierToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin tedarikçisini silmeye yetkiniz yok.");
        }

        supplierRepository.delete(supplierToDelete);
    }
}