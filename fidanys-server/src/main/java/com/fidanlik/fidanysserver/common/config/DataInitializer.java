package com.fidanlik.fidanysserver.common.config;

import com.fidanlik.fidanysserver.role.model.Permission;
import com.fidanlik.fidanysserver.role.model.Role;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.tenant.model.Tenant;
import com.fidanlik.fidanysserver.role.repository.PermissionRepository;
import com.fidanlik.fidanysserver.role.repository.RoleRepository;
import com.fidanlik.fidanysserver.user.repository.UserRepository;
import com.fidanlik.fidanysserver.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        System.out.println("Başlangıç verileri kontrol ediliyor...");

        // Yeni ve mevcut kiracılar için başlangıç verilerini oluştur.
        initializeTenantData("ata.fidanys.com.tr");
        initializeTenantData("saygi.fidanys.com.tr");
        initializeTenantData("test.fidanys.com.tr");
    }

    @Transactional
    private void initializeTenantData(String tenantName) {
        Tenant tenant = tenantRepository.findByName(tenantName)
                .orElseGet(() -> {
                    System.out.println("Ana tenant '" + tenantName + "' bulunamadı, oluşturuluyor...");
                    Tenant newTenant = new Tenant();
                    newTenant.setName(tenantName);
                    newTenant.setActive(true);
                    return tenantRepository.save(newTenant);
                });

        String tenantId = tenant.getId();

        if (roleRepository.findAllByTenantId(tenantId).isEmpty()) {
            System.out.println("'" + tenantName + "' için roller bulunamadı, başlangıç verileri (İzinler, Roller, Kullanıcılar) oluşturuluyor...");

            // --- İZİNLER ---
            Permission cariYonetimi = createPermission("CARI_YONETIMI", "Müşteri ve tedarikçi cari hesaplarını yönetme.", tenantId);
            Permission faturaYonetimi = createPermission("FATURA_YONETIMI", "Faturaları yönetme yetkisi.", tenantId);
            Permission odemeYonetimi = createPermission("ODEME_YONETIMI", "Ödeme ve tahsilatları yönetme.", tenantId);
            Permission giderYonetimi = createPermission("GIDER_YONETIMI", "Şirket giderlerini yönetme.", tenantId);
            Permission raporlama = createPermission("RAPORLAMA", "Muhasebe raporlarını görüntüleme.", tenantId);
            permissionRepository.saveAll(Arrays.asList(cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama));
            System.out.println("Muhasebe izinleri oluşturuldu.");

            Permission tumYetkiler = createPermission("TUM_YETKILER", "Sistemdeki tüm yetkileri kapsar.", tenantId);
            Permission kullaniciYonetimi = createPermission("KULLANICI_YONETIMI", "Kullanıcıları yönetme yetkisi.", tenantId);
            Permission fidanEkle = createPermission("FIDAN_EKLE", "Yeni fidan ekleme yetkisi.", tenantId);
            Permission stokGoruntuleme = createPermission("STOK_GORUNTULEME", "Stok durumunu görüntüleme yetkisi.", tenantId);
            Permission siparisOlusturma = createPermission("SIPARIS_OLUSTURMA", "Yeni sipariş oluşturma yetkisi.", tenantId);
            Permission malKabulOlusturma = createPermission("MAL_KABUL_OLUSTURMA", "Mal kabul kaydı oluşturma yetkisi.", tenantId);
            Permission siparisSevkiyat = createPermission("SIPARIS_SEVKIYAT", "Sipariş sevkiyatı yapma.", tenantId);
            permissionRepository.saveAll(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat));
            System.out.println("Mevcut izinler oluşturuldu.");

            // --- ROLLER ---
            Role adminRol = new Role();
            adminRol.setName("ADMIN");
            adminRol.setTenantId(tenantId);
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat, cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama)));
            roleRepository.save(adminRol);

            Role satisPersoneliRol = new Role();
            satisPersoneliRol.setName("SALES");
            satisPersoneliRol.setTenantId(tenantId);
            satisPersoneliRol.setPermissions(new HashSet<>(Arrays.asList(siparisOlusturma, stokGoruntuleme, fidanEkle)));
            roleRepository.save(satisPersoneliRol);

            Role depoSorumlusuRol = new Role();
            depoSorumlusuRol.setName("WAREHOUSE_STAFF");
            depoSorumlusuRol.setTenantId(tenantId);
            depoSorumlusuRol.setPermissions(new HashSet<>(Arrays.asList(malKabulOlusturma, stokGoruntuleme, siparisSevkiyat)));
            roleRepository.save(depoSorumlusuRol);

            Role muhasebeRol = new Role();
            muhasebeRol.setName("ACCOUNTANT");
            muhasebeRol.setTenantId(tenantId);
            muhasebeRol.setPermissions(new HashSet<>(Arrays.asList(cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama, stokGoruntuleme)));
            roleRepository.save(muhasebeRol);
            System.out.println("Roller oluşturuldu.");

            // --- KULLANICILAR ---
            // Her kiracı için farklı bir email ve kullanıcı adı oluşturmak daha mantıklı.
            createUser("admin", "admin@" + tenantName, "admin", tenantId, new HashSet<>(Collections.singletonList(adminRol.getId())));
            createUser("satis", "satis@" + tenantName, "satis", tenantId, new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            createUser("depo", "depo@" + tenantName, "depo", tenantId, new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            createUser("muhasebe", "muhasebe@" + tenantName, "muhasebe", tenantId, new HashSet<>(Collections.singletonList(muhasebeRol.getId())));
            System.out.println("Kullanıcılar oluşturuldu.");

        } else {
            System.out.println("'" + tenantName + "' için varsayılan roller zaten mevcut, veri oluşturma işlemi atlandı.");
        }
    }

    private Permission createPermission(String name, String description, String tenantId) {
        Permission p = new Permission();
        p.setName(name);
        p.setDescription(description);
        p.setTenantId(tenantId);
        return p;
    }

    private void createUser(String username, String email, String password, String tenantId, Set<String> roleIds) {
        if (userRepository.findByUsernameAndTenantId(username, tenantId).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setTenantId(tenantId);
            user.setRoleIds(roleIds);
            userRepository.save(user);
        }
    }
}