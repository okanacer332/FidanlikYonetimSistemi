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

        // ANA KONTROL: Eğer bu tenant için roller yoksa, tüm başlangıç verisini oluştur.
        if (roleRepository.findAllByTenantId(ataTechTenantId).isEmpty()) {
            System.out.println("Bu tenant için roller bulunamadı, başlangıç verileri (İzinler, Roller, Kullanıcılar) oluşturuluyor...");

            // --- İzinleri Oluştur ---
            Permission tumYetkiler = createPermission("TUM_YETKILER", "Sistemdeki tüm yetkileri kapsar.", ataTechTenantId);
            Permission kullaniciYonetimi = createPermission("KULLANICI_YONETIMI", "Kullanıcıları yönetme yetkisi.", ataTechTenantId);
            Permission fidanEkle = createPermission("FIDAN_EKLE", "Yeni fidan ekleme yetkisi.", ataTechTenantId);
            Permission stokGoruntuleme = createPermission("STOK_GORUNTULEME", "Stok durumunu görüntüleme yetkisi.", ataTechTenantId);
            Permission siparisOlusturma = createPermission("SIPARIS_OLUSTURMA", "Yeni sipariş oluşturma yetkisi.", ataTechTenantId);
            Permission malKabulOlusturma = createPermission("MAL_KABUL_OLUSTURMA", "Mal kabul kaydı oluşturma yetkisi.", ataTechTenantId);
            Permission siparisSevkiyat = createPermission("SIPARIS_SEVKIYAT", "Sipariş sevkiyatı yapma.", ataTechTenantId);
            permissionRepository.saveAll(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat));
            System.out.println("İzinler oluşturuldu.");

            // --- Rolleri Oluştur ---
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

            // --- Varsayılan Kullanıcıları Oluştur ve Rollere Bağla ---
            createUser("admin", "admin@fidanys.xyz", "admin", ataTechTenantId, new HashSet<>(Collections.singletonList(adminRol.getId())));
            System.out.println("Kullanıcı oluşturuldu: admin");

            createUser("satis", "satis@fidanys.xyz", "satis", ataTechTenantId, new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            System.out.println("Kullanıcı oluşturuldu: satis");

            createUser("depo", "depo@fidanys.xyz", "depo", ataTechTenantId, new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            System.out.println("Kullanıcı oluşturuldu: depo");

        } else {
            System.out.println("Varsayılan roller zaten mevcut, veri oluşturma işlemi atlandı.");
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
        // Kullanıcı zaten var mı diye kontrol et, eğer varsa tekrar oluşturma.
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