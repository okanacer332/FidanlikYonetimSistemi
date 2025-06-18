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
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
// @Profile("dev")  // <-- DİKKAT: Bu satırı kaldırıyoruz! Artık her ortamda çalışacak.
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // 1. Ana Tenant'ı bul veya oluştur (Idempotent)
        Tenant ataTechTenant = tenantRepository.findByName("ata.fidanys.xyz")
                .orElseGet(() -> {
                    System.out.println("Ana tenant 'ata.fidanys.xyz' bulunamadı, oluşturuluyor...");
                    Tenant newTenant = new Tenant();
                    newTenant.setName("ata.fidanys.xyz");
                    newTenant.setActive(true);
                    return tenantRepository.save(newTenant);
                });

        String ataTechTenantId = ataTechTenant.getId();

        // 2. Roller ve izinler daha önce oluşturulmamışsa oluştur (Idempotent)
        if (roleRepository.findAllByTenantId(ataTechTenantId).isEmpty()) {
            System.out.println("Bu tenant için roller bulunamadı, başlangıç verileri oluşturuluyor...");

            // İzinleri Oluştur
            Permission tumYetkiler = permissionRepository.save(createPermission("TUM_YETKILER", "Sistemdeki tüm yetkileri kapsar.", ataTechTenantId));
            Permission kullaniciYonetimi = permissionRepository.save(createPermission("KULLANICI_YONETIMI", "Kullanıcıları yönetme yetkisi.", ataTechTenantId));
            Permission fidanEkle = permissionRepository.save(createPermission("FIDAN_EKLE", "Yeni fidan ekleme yetkisi.", ataTechTenantId));
            Permission stokGoruntuleme = permissionRepository.save(createPermission("STOK_GORUNTULEME", "Stok durumunu görüntüleme yetkisi.", ataTechTenantId));
            Permission siparisOlusturma = permissionRepository.save(createPermission("SIPARIS_OLUSTURMA", "Yeni sipariş oluşturma yetkisi.", ataTechTenantId));
            Permission malKabulOlusturma = permissionRepository.save(createPermission("MAL_KABUL_OLUSTURMA", "Mal kabul kaydı oluşturma yetkisi.", ataTechTenantId));
            Permission siparisSevkiyat = permissionRepository.save(createPermission("SIPARIS_SEVKIYAT", "Sipariş sevkiyatı yapma.", ataTechTenantId));
            System.out.println("İzinler oluşturuldu.");

            // Rolleri Oluştur
            Role adminRol = new Role();
            adminRol.setName("Yönetici");
            adminRol.setTenantId(ataTechTenantId);
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat)));
            roleRepository.save(adminRol);

            Role satisPersoneliRol = new Role();
            satisPersoneliRol.setName("Satış Personeli");
            satisPersoneliRol.setTenantId(ataTechTenantId);
            satisPersoneliRol.setPermissions(new HashSet<>(Arrays.asList(siparisOlusturma, stokGoruntuleme, fidanEkle)));
            roleRepository.save(satisPersoneliRol);

            Role depoSorumlusuRol = new Role();
            depoSorumlusuRol.setName("Depo Sorumlusu");
            depoSorumlusuRol.setTenantId(ataTechTenantId);
            depoSorumlusuRol.setPermissions(new HashSet<>(Arrays.asList(malKabulOlusturma, stokGoruntuleme, siparisSevkiyat)));
            roleRepository.save(depoSorumlusuRol);
            System.out.println("Roller oluşturuldu.");

            // 3. Varsayılan kullanıcılar yoksa oluştur (Idempotent)
            System.out.println("Varsayılan kullanıcılar kontrol ediliyor...");
            if (userRepository.findByUsernameAndTenantId("admin", ataTechTenantId).isEmpty()) {
                createUser("admin", "admin@fidanys.xyz", "admin", ataTechTenantId, new HashSet<>(Collections.singletonList(adminRol.getId())));
                System.out.println("Kullanıcı oluşturuldu: admin");
            }
            if (userRepository.findByUsernameAndTenantId("satis", ataTechTenantId).isEmpty()) {
                createUser("satis", "satis@fidanys.xyz", "satis", ataTechTenantId, new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
                System.out.println("Kullanıcı oluşturuldu: satis");
            }
            if (userRepository.findByUsernameAndTenantId("depo", ataTechTenantId).isEmpty()) {
                createUser("depo", "depo@fidanys.xyz", "depo", ataTechTenantId, new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
                System.out.println("Kullanıcı oluşturuldu: depo");
            }
        } else {
            System.out.println("Bu tenant için roller zaten mevcut, veri oluşturma işlemi atlandı.");
        }
    }

    // Yardımcı metotlar
    private Permission createPermission(String name, String description, String tenantId) {
        Permission p = new Permission();
        p.setName(name);
        p.setDescription(description);
        p.setTenantId(tenantId);
        return p;
    }

    private void createUser(String username, String email, String password, String tenantId, Set<String> roleIds) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setTenantId(tenantId);
        user.setRoleIds(roleIds);
        userRepository.save(user);
    }
}