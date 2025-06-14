package com.fidanlik.fysserver.config;

import com.fidanlik.fysserver.model.Permission;
import com.fidanlik.fysserver.model.Role;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.model.Tenant; // Tenant modelini import et
import com.fidanlik.fysserver.repository.PermissionRepository;
import com.fidanlik.fysserver.repository.RoleRepository;
import com.fidanlik.fysserver.repository.UserRepository;
import com.fidanlik.fysserver.repository.TenantRepository;
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
@Profile("dev") // Sadece "dev" profilinde çalışmasını sağlarız
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Sadece veritabanı boşsa seed et
        if (tenantRepository.count() == 0 && userRepository.count() == 0 && roleRepository.count() == 0 && permissionRepository.count() == 0) {
            System.out.println("Veritabanı boş, başlangıç verileri seed ediliyor...");

            // 1. Tenant Oluştur (Her şirketi temsil eden bir tenant)
            Tenant okanTechTenant = new Tenant();
            okanTechTenant.setName("okan.fidanys.com");
            okanTechTenant.setActive(true);
            okanTechTenant = tenantRepository.save(okanTechTenant);
            String okanTechTenantId = okanTechTenant.getId();
            System.out.println("Tenant oluşturuldu: " + okanTechTenant.getName() + " (ID: " + okanTechTenantId + ")");


            // 2. İzinleri Oluştur (Tenant'a özel veya genel olabilir)
            Permission tumYetkiler = new Permission();
            tumYetkiler.setName("TUM_YETKILER");
            tumYetkiler.setDescription("Sistemdeki tüm yetkileri kapsar.");
            tumYetkiler.setTenantId(okanTechTenantId);
            tumYetkiler = permissionRepository.save(tumYetkiler);

            Permission kullaniciYonetimi = new Permission();
            kullaniciYonetimi.setName("KULLANICI_YONETIMI");
            kullaniciYonetimi.setDescription("Kullanıcıları yönetme yetkisi.");
            kullaniciYonetimi.setTenantId(okanTechTenantId);
            kullaniciYonetimi = permissionRepository.save(kullaniciYonetimi);

            Permission fidanEkle = new Permission();
            fidanEkle.setName("FIDAN_EKLE");
            fidanEkle.setDescription("Yeni fidan ekleme yetkisi.");
            fidanEkle.setTenantId(okanTechTenantId);
            fidanEkle = permissionRepository.save(fidanEkle);

            System.out.println("İzinler oluşturuldu.");

            // 3. Rolleri Oluştur (Tenant'a özel)
            Role adminRol = new Role();
            adminRol.setName("Yönetici");
            adminRol.setTenantId(okanTechTenantId);
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle))); // Tüm yetkiler
            adminRol = roleRepository.save(adminRol);

            Role satisPersoneliRol = new Role();
            satisPersoneliRol.setName("Satış Personeli");
            satisPersoneliRol.setTenantId(okanTechTenantId);
            // Sadece fidan ekleme izni olsun şimdilik
            satisPersoneliRol.setPermissions(new HashSet<>(Collections.singletonList(fidanEkle)));
            satisPersoneliRol = roleRepository.save(satisPersoneliRol);

            Role depoSorumlusuRol = new Role();
            depoSorumlusuRol.setName("Depo Sorumlusu");
            depoSorumlusuRol.setTenantId(okanTechTenantId);
            depoSorumlusuRol.setPermissions(Collections.emptySet()); // Şimdilik boş yetkiler
            depoSorumlusuRol = roleRepository.save(depoSorumlusuRol);

            System.out.println("Roller oluşturuldu.");

            // 4. Kullanıcıları Oluştur (Tenant'a özel)
            // Yönetici kullanıcı (okan)
            User adminUser = new User();
            adminUser.setUsername("okan");
            adminUser.setEmail("okan@fidanys.com");
            adminUser.setPassword(passwordEncoder.encode("admin123")); // Şifre hash'leniyor
            adminUser.setTenantId(okanTechTenantId);
            adminUser.setRoleIds(new HashSet<>(Collections.singletonList(adminRol.getId())));
            userRepository.save(adminUser);
            System.out.println("Yönetici kullanıcı oluşturuldu: okan");

            // Satış Personeli örneği
            User satisUser = new User();
            satisUser.setUsername("satis1");
            satisUser.setEmail("satis1@fidanys.com");
            satisUser.setPassword(passwordEncoder.encode("satis123"));
            satisUser.setTenantId(okanTechTenantId);
            satisUser.setRoleIds(new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            userRepository.save(satisUser);
            System.out.println("Satış Personeli kullanıcı oluşturuldu: satis1");

            // Depo Sorumlusu örneği
            User depoUser = new User();
            depoUser.setUsername("depo1");
            depoUser.setEmail("depo1@fidanys.com");
            depoUser.setPassword(passwordEncoder.encode("depo123"));
            depoUser.setTenantId(okanTechTenantId);
            depoUser.setRoleIds(new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            userRepository.save(depoUser);
            System.out.println("Depo Sorumlusu kullanıcı oluşturuldu: depo1");

            System.out.println("-----------------------------------------------------------------");
            System.out.println("Veritabanı başarıyla sıfırlandı ve seed edildi.");
            System.out.println("Kullanıcılar: okan/admin123, satis1/satis123, depo1/depo123 (Tenant: okan.fidanys.com)");
            System.out.println("-----------------------------------------------------------------");
        } else {
            System.out.println("Veritabanı dolu, seed işlemi atlandı.");
        }
    }
}