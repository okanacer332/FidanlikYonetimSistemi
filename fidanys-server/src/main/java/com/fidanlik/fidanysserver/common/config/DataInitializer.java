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
            Tenant ataTechTenant = new Tenant();
            ataTechTenant.setName("ata.fidanys.xyz"); // Burası güncellendi!
            ataTechTenant.setActive(true);
            ataTechTenant = tenantRepository.save(ataTechTenant);
            String ataTechTenantId = ataTechTenant.getId();
            System.out.println("Tenant oluşturuldu: " + ataTechTenant.getName() + " (ID: " + ataTechTenantId + ")");


            // 2. İzinleri Oluştur (Tenant'a özel veya genel olabilir)
            Permission tumYetkiler = new Permission();
            tumYetkiler.setName("TUM_YETKILER");
            tumYetkiler.setDescription("Sistemdeki tüm yetkileri kapsar.");
            tumYetkiler.setTenantId(ataTechTenantId);
            tumYetkiler = permissionRepository.save(tumYetkiler);

            Permission kullaniciYonetimi = new Permission();
            kullaniciYonetimi.setName("KULLANICI_YONETIMI");
            kullaniciYonetimi.setDescription("Kullanıcıları yönetme yetkisi.");
            kullaniciYonetimi.setTenantId(ataTechTenantId);
            kullaniciYonetimi = permissionRepository.save(kullaniciYonetimi);

            Permission fidanEkle = new Permission();
            fidanEkle.setName("FIDAN_EKLE");
            fidanEkle.setDescription("Yeni fidan ekleme yetkisi.");
            fidanEkle.setTenantId(ataTechTenantId);
            fidanEkle = permissionRepository.save(fidanEkle);

            // Yeni eklenen izinler
            Permission stokGoruntuleme = new Permission();
            stokGoruntuleme.setName("STOK_GORUNTULEME");
            stokGoruntuleme.setDescription("Stok durumunu görüntüleme yetkisi.");
            stokGoruntuleme.setTenantId(ataTechTenantId);
            stokGoruntuleme = permissionRepository.save(stokGoruntuleme);

            Permission siparisOlusturma = new Permission();
            siparisOlusturma.setName("SIPARIS_OLUSTURMA");
            siparisOlusturma.setDescription("Yeni sipariş oluşturma yetkisi.");
            siparisOlusturma.setTenantId(ataTechTenantId);
            siparisOlusturma = permissionRepository.save(siparisOlusturma);

            Permission malKabulOlusturma = new Permission();
            malKabulOlusturma.setName("MAL_KABUL_OLUSTURMA");
            malKabulOlusturma.setDescription("Mal kabul kaydı oluşturma yetkisi.");
            malKabulOlusturma.setTenantId(ataTechTenantId);
            malKabulOlusturma = permissionRepository.save(malKabulOlusturma);

            Permission siparisSevkiyat = new Permission();
            siparisSevkiyat.setName("SIPARIS_SEVKIYAT");
            siparisSevkiyat.setDescription("Siparişleri sevkedildi olarak işaretleme ve stok düşüşünü tetikleme.");
            siparisSevkiyat.setTenantId(ataTechTenantId);
            siparisSevkiyat = permissionRepository.save(siparisSevkiyat);

            System.out.println("İzinler oluşturuldu.");

            // 3. Rolleri Oluştur (Tenant'a özel)
            Role adminRol = new Role();
            adminRol.setName("Yönetici");
            adminRol.setTenantId(ataTechTenantId);
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle, stokGoruntuleme, siparisOlusturma, malKabulOlusturma, siparisSevkiyat))); // Tüm yeni izinler admin'e eklendi
            adminRol = roleRepository.save(adminRol);

            Role satisPersoneliRol = new Role();
            satisPersoneliRol.setName("Satış Personeli");
            satisPersoneliRol.setTenantId(ataTechTenantId);
            // Satış Personeli için güncellenmiş izinler
            satisPersoneliRol.setPermissions(new HashSet<>(Arrays.asList(siparisOlusturma, stokGoruntuleme, fidanEkle))); // Örnek: Fidan ekleme, sipariş oluşturma, stok görüntüleme
            satisPersoneliRol = roleRepository.save(satisPersoneliRol);

            Role depoSorumlusuRol = new Role();
            depoSorumlusuRol.setName("Depo Sorumlusu");
            depoSorumlusuRol.setTenantId(ataTechTenantId);
            // Depo Sorumlusu için güncellenmiş izinler
            depoSorumlusuRol.setPermissions(new HashSet<>(Arrays.asList(malKabulOlusturma, stokGoruntuleme, siparisSevkiyat))); // Örnek: Mal kabul, stok görüntüleme, sipariş sevkiyat
            depoSorumlusuRol = roleRepository.save(depoSorumlusuRol);

            System.out.println("Roller oluşturuldu.");

            // 4. Kullanıcıları Oluştur (Tenant'a özel)
            // Yönetici kullanıcı (admin)
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@fidanys.xyz"); // Email de güncellendi
            adminUser.setPassword(passwordEncoder.encode("admin")); // Şifre hash'leniyor
            adminUser.setTenantId(ataTechTenantId);
            adminUser.setRoleIds(new HashSet<>(Collections.singletonList(adminRol.getId())));
            userRepository.save(adminUser);
            System.out.println("Yönetici kullanıcı oluşturuldu: admin");

            // Satış Personeli örneği
            User satisUser = new User();
            satisUser.setUsername("satis");
            satisUser.setEmail("satis@fidanys.xyz"); // Email de güncellendi
            satisUser.setPassword(passwordEncoder.encode("satis"));
            satisUser.setTenantId(ataTechTenantId);
            satisUser.setRoleIds(new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            userRepository.save(satisUser);
            System.out.println("Satış Personeli kullanıcı oluşturuldu: satis");

            // Depo Sorumlusu örneği
            User depoUser = new User();
            depoUser.setUsername("depo");
            depoUser.setEmail("depo@fidanys.xyz"); // Email de güncellendi
            depoUser.setPassword(passwordEncoder.encode("depo"));
            depoUser.setTenantId(ataTechTenantId);
            depoUser.setRoleIds(new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            userRepository.save(depoUser);
            System.out.println("Depo Sorumlusu kullanıcı oluşturuldu: depo");

            System.out.println("-----------------------------------------------------------------");
            System.out.println("Veritabanı başarıyla sıfırlandı ve seed edildi.");
            System.out.println("Kullanıcılar: admin/admin, satis/satis, depo/depo (Tenant: ata.fidanys.xyz)");
            System.out.println("-----------------------------------------------------------------");
        } else {
            System.out.println("Veritabanı dolu, seed işlemi atlandı.");
        }
    }
}