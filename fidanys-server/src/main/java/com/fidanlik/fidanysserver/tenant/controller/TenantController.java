// Yeni konum: src/main/java/com/fidanlik/fidanysserver/tenant/controller/TenantController.java
package com.fidanlik.fidanysserver.tenant.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tenants")
public class TenantController {
    // Tenant yönetimi API'leri buraya gelecek.
    // Örneğin: Tenant listeleme, detay görüntüleme, güncelleme, silme.
    // Ancak dikkatli olmalı, tenant silme gibi kritik operasyonlar genellikle özel yetkilendirme ister.
}