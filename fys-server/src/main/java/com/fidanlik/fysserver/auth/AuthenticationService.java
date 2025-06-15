package com.fidanlik.fysserver.auth;

import com.fidanlik.fysserver.auth.dto.LoginRequest;
import com.fidanlik.fysserver.auth.dto.LoginResponse;
import com.fidanlik.fysserver.config.security.JwtService;
import com.fidanlik.fysserver.config.security.TenantAuthenticationToken;
import com.fidanlik.fysserver.model.Tenant; // Tenant modelini import et
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.TenantRepository; // TenantRepository import et
import com.fidanlik.fysserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; // Ekledik
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository; // Yeni: TenantRepository eklendi
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        // 1. Tenant adından Tenant ID'yi bul
        // Eğer request.getTenantName() null ise veya boşsa bir hata döndürün.
        if (request.getTenantName() == null || request.getTenantName().trim().isEmpty()) {
            throw new BadCredentialsException("Şirket adı (tenantName) eksik.");
        }

        Tenant tenant = tenantRepository.findByName(request.getTenantName()) // findByName metodu gerekecek
                .orElseThrow(() -> new BadCredentialsException("Bilinmeyen şirket adı: " + request.getTenantName()));

        // Tenant aktif mi kontrol edelim
        if (!tenant.isActive()) {
            throw new BadCredentialsException("Şirket hesabı aktif değil: " + request.getTenantName());
        }

        String actualTenantId = tenant.getId(); // Dinamik tenantId'yi aldık

        // 2. Tenant ID ile kimlik doğrulama
        Authentication authentication = authenticationManager.authenticate(
                new TenantAuthenticationToken(
                        request.getUsername(),
                        request.getPassword(),
                        actualTenantId // Dinamik tenantId'yi token'a ekledik
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Kimlik doğrulama sonrası kullanıcıyı ve token'ı oluştur
        // Burada user objesini tekrar almak, principal'daki user ile aynı olmalı
        // ve rolleri dolu gelmelidir.
        var user = userRepository.findByUsernameAndTenantId(request.getUsername(), actualTenantId)
                .orElseThrow(() -> new IllegalStateException("Kimlik doğrulama sonrası kullanıcı bulunamadı."));

        var jwtToken = jwtService.generateToken(user); // JWT'yi oluştururken user objesi zaten tenantId içeriyor.
        return LoginResponse.builder().token(jwtToken).build();
    }
}