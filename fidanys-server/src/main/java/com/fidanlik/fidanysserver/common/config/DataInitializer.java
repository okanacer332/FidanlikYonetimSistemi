// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
package com.fidanlik.fidanysserver.common.config;

import com.fidanlik.fidanysserver.role.model.Permission; // Yeni paket yolu
import com.fidanlik.fidanysserver.role.model.Role; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu
import com.fidanlik.fidanysserver.tenant.model.Tenant; // Yeni paket yolu
import com.fidanlik.fidanysserver.role.repository.PermissionRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.role.repository.RoleRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.repository.UserRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.tenant.repository.TenantRepository; // Yeni paket yolu
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
        if (tenantRepository.count() == 0 && userRepository.count() == 0 && roleRepository.count() == 0 && permissionRepository.count() == 0) { // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            System.out.println("Veritabanı boş, başlangıç verileri seed ediliyor...");

            // 1. Tenant Oluştur (Her şirketi temsil eden bir tenant)
            Tenant ataTechTenant = new Tenant();
            ataTechTenant.setName("ata.fidanys.xyz"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            ataTechTenant.setActive(true); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            ataTechTenant = tenantRepository.save(ataTechTenant); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            String ataTechTenantId = ataTechTenant.getId(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            System.out.println("Tenant oluşturuldu: " + ataTechTenant.getName() + " (ID: " + ataTechTenantId + ")");


            // 2. İzinleri Oluştur (Tenant'a özel veya genel olabilir)
            Permission tumYetkiler = new Permission(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            tumYetkiler.setName("TUM_YETKILER"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            tumYetkiler.setDescription("Sistemdeki tüm yetkileri kapsar."); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            tumYetkiler.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            tumYetkiler = permissionRepository.save(tumYetkiler); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            Permission kullaniciYonetimi = new Permission(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            kullaniciYonetimi.setName("KULLANICI_YONETIMI"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            kullaniciYonetimi.setDescription("Kullanıcıları yönetme yetkisi."); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            kullaniciYonetimi.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            kullaniciYonetimi = permissionRepository.save(kullaniciYonetimi); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            Permission fidanEkle = new Permission(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            fidanEkle.setName("FIDAN_EKLE"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            fidanEkle.setDescription("Yeni fidan ekleme yetkisi."); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            fidanEkle.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            fidanEkle = permissionRepository.save(fidanEkle); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            System.out.println("İzinler oluşturuldu.");

            // 3. Rolleri Oluştur (Tenant'a özel)
            Role adminRol = new Role(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            adminRol.setName("Yönetici"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            adminRol.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            adminRol.setPermissions(new HashSet<>(Arrays.asList(tumYetkiler, kullaniciYonetimi, fidanEkle))); // Tüm yetkiler // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            adminRol = roleRepository.save(adminRol); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            Role satisPersoneliRol = new Role(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            satisPersoneliRol.setName("Satış Personeli"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            satisPersoneliRol.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            // Sadece fidan ekleme izni olsun şimdilik
            satisPersoneliRol.setPermissions(new HashSet<>(Collections.singletonList(fidanEkle))); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            satisPersoneliRol = roleRepository.save(satisPersoneliRol); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            Role depoSorumlusuRol = new Role(); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            depoSorumlusuRol.setName("Depo Sorumlusu"); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            depoSorumlusuRol.setTenantId(ataTechTenantId); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            depoSorumlusuRol.setPermissions(Collections.emptySet()); // Şimdilik boş yetkiler // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            depoSorumlusuRol = roleRepository.save(depoSorumlusuRol); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java

            System.out.println("Roller oluşturuldu.");

            // 4. Kullanıcıları Oluştur (Tenant'a özel)
            // Yönetici kullanıcı (admin)
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@fidanys.com");
            adminUser.setPassword(passwordEncoder.encode("admin")); // Şifre hash'leniyor
            adminUser.setTenantId(ataTechTenantId);
            adminUser.setRoleIds(new HashSet<>(Collections.singletonList(adminRol.getId())));
            userRepository.save(adminUser);
            System.out.println("Yönetici kullanıcı oluşturuldu: admin");

            // Satış Personeli örneği
            User satisUser = new User();
            satisUser.setUsername("satis");
            satisUser.setEmail("satis@fidanys.com");
            satisUser.setPassword(passwordEncoder.encode("satis"));
            satisUser.setTenantId(ataTechTenantId);
            satisUser.setRoleIds(new HashSet<>(Collections.singletonList(satisPersoneliRol.getId())));
            userRepository.save(satisUser);
            System.out.println("Satış Personeli kullanıcı oluşturuldu: satis");

            // Depo Sorumlusu örneği
            User depoUser = new User();
            depoUser.setUsername("depo");
            depoUser.setEmail("depo@fidanys.com");
            depoUser.setPassword(passwordEncoder.encode("depo"));
            depoUser.setTenantId(ataTechTenantId);
            depoUser.setRoleIds(new HashSet<>(Collections.singletonList(depoSorumlusuRol.getId())));
            userRepository.save(depoUser);
            System.out.println("Depo Sorumlusu kullanıcı oluşturuldu: depo");

            System.out.println("-----------------------------------------------------------------");
            System.out.println("Veritabanı başarıyla sıfırlandı ve seed edildi.");
            System.out.println("Kullanıcılar: admin/admin, satis/satis, depo/depo (Tenant: ata.fidanys.com)");
            System.out.println("-----------------------------------------------------------------");
        } else { // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
            System.out.println("Veritabanı dolu, seed işlemi atlandı."); // cite: okanacer332/fidanlikyonetimsistemi/FidanlikYonetimSistemi-b05dc3c506dcd752b5ff3386df5bb12e988492da/fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/config/DataInitializer.java
        }
    }
}