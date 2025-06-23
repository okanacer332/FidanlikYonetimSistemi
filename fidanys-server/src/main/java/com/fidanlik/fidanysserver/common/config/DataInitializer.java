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

        Tenant ataTechTenant = tenantRepository.findByName("ata.fidanys.xyz")
                .orElseGet(() -> {
                    System.out.println("Ana tenant 'ata.fidanys.xyz' bulunamadı, oluşturuluyor...");
                    Tenant newTenant = new Tenant();
                    newTenant.setName("ata.fidanys.xyz");
                    newTenant.setActive(true);
                    return tenantRepository.save(newTenant);
                });

        String ataTechTenantId = ataTechTenant.getId();

        if (roleRepository.findAllByTenantId(ataTechTenantId).isEmpty()) {
            System.out.println("Bu tenant için roller bulunamadı, başlangıç verileri (İzinler, Roller, Kullanıcılar) oluşturuluyor...");

            // --- YENİ MUHASEBE İZİNLERİ ---
            Permission cariYonetimi = createPermission("CARI_YONETIMI", "Müşteri ve tedarikçi cari hesaplarını yönetme.", ataTechTenantId);
            Permission faturaYonetimi = createPermission("FATURA_YONETIMI", "Faturaları yönetme yetkisi.", ataTechTenantId);
            Permission odemeYonetimi = createPermission("ODEME_YONETIMI", "Ödeme ve tahsilatları yönetme.", ataTechTenantId);
            Permission giderYonetimi = createPermission("GIDER_YONETIMI", "Şirket giderlerini yönetme.", ataTechTenantId);
            Permission raporlama = createPermission("RAPORLAMA", "Muhasebe raporlarını görüntüleme.", ataTechTenantId);
            permissionRepository.saveAll(Arrays.asList(cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama));
            System.out.println("Muhasebe izinleri oluşturuldu.");

            Permission tumYetkiler = createPermission("TUM_YETKILER", "Sistemdeki tüm yetkileri kapsar.", ataTechTenantId);
            Permission kullaniciYonetimi = createPermission("KULLANICI_YONETIMI", "Kullanıcıları yönetme yetkisi.", ataTechTenantId);
            Permission fidanEkle = createPermission("FIDAN_EKLE", "Yeni fidan ekleme yetkisi.", ataTechTenantId);
            Permission stokGoruntuleme = createPermission("STOK_GORUNTULEME", "Stok durumunu görüntüleme yetkisi.", ataTechTenantId);
            Permission siparisOlusturma = createPermission("SIPARIS_OLUSTURMA", "Yeni sipariş oluşturma yetkisi.", ataTechTenantId);
            Permission malKabulOlusturma = createPermission("MAL_KABUL_OLUSTURMA", "Mal kabul kaydı oluşturma yetkisi.", ataTechTenantId);
            Permission siparisSevkiyat = createPermission("SIPARIS_SEVKIYAT", "Sipariş sevkiyatı yapma.", ataTechTenantId);
            permissionRepository.saveAll(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat));
            System.out.println("Mevcut izinler oluşturuldu.");

            // --- ADMIN Rolü ---
            Role adminRol = new Role();
            adminRol.setName("ADMIN");
            adminRol.setTenantId(ataTechTenantId);
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat, cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama)));
            roleRepository.save(adminRol);

            // --- SALES Rolü ---
            Role satisPersoneliRol = new Role();
            satisPersoneliRol.setName("SALES");
            satisPersoneliRol.setTenantId(ataTechTenantId);
            satisPersoneliRol.setPermissions(new HashSet<>(Arrays.asList(siparisOlusturma, stokGoruntuleme, fidanEkle)));
            roleRepository.save(satisPersoneliRol);

            // --- WAREHOUSE Rolü ---
            Role depoSorumlusuRol = new Role();
            depoSorumlusuRol.setName("WAREHOUSE_STAFF");
            depoSorumlusuRol.setTenantId(ataTechTenantId);
            depoSorumlusuRol.setPermissions(new HashSet<>(Arrays.asList(malKabulOlusturma, stokGoruntuleme, siparisSevkiyat)));
            roleRepository.save(depoSorumlusuRol);

            // --- YENİ ACCOUNTANT Rolü ---
            Role muhasebeRol = new Role();
            muhasebeRol.setName("ACCOUNTANT");
            muhasebeRol.setTenantId(ataTechTenantId);
            muhasebeRol.setPermissions(new HashSet<>(Arrays.asList(cariYonetimi, faturaYonetimi, odemeYonetimi, giderYonetimi, raporlama, stokGoruntuleme)));
            roleRepository.save(muhasebeRol);
            System.out.println("Roller oluşturuldu.");

            // --- Kullanıcılar ---
            createUser("admin", "admin@fidanys.xyz", "admin", ataTechTenantId, new HashSet<>(Collections.singletonList(adminRol.getId())));
            createUser("satis", "satis@fidanys.xyz", "satis", ataTechTenantId, new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            createUser("depo", "depo@fidanys.xyz", "depo", ataTechTenantId, new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            createUser("muhasebe", "muhasebe@fidanys.xyz", "muhasebe", ataTechTenantId, new HashSet<>(Collections.singletonList(muhasebeRol.getId())));
            System.out.println("Kullanıcılar oluşturuldu.");

        } else {
            System.out.println("Varsayılan roller zaten mevcut, veri oluşturma işlemi atlandı.");
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