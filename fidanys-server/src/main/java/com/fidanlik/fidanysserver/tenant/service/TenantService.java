// Yeni konum: src/main/java/com/fidanlik/fidanysserver/tenant/service/TenantService.java
package com.fidanlik.fidanysserver.tenant.service;

import com.fidanlik.fidanysserver.tenant.model.Tenant; // Yeni paket yolu
import com.fidanlik.fidanysserver.tenant.repository.TenantRepository; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public Optional<Tenant> findTenantByName(String name) {
        return tenantRepository.findByName(name);
    }

    public Tenant saveTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }
}