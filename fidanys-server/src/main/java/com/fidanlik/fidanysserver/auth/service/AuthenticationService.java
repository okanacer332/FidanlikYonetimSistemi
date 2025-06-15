// Yeni konum: src/main/java/com/fidanlik/fidanysserver/auth/service/AuthenticationService.java
package com.fidanlik.fidanysserver.auth.service;

import com.fidanlik.fidanysserver.auth.dto.LoginRequest; // Yeni paket yolu
import com.fidanlik.fidanysserver.auth.dto.LoginResponse; // Yeni paket yolu
import com.fidanlik.fidanysserver.common.security.JwtService; // Yeni paket yolu
import com.fidanlik.fidanysserver.common.security.TenantAuthenticationToken; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu (User artık user.model altında)
import com.fidanlik.fidanysserver.tenant.model.Tenant; // Yeni paket yolu (Tenant artık tenant.model altında)
import com.fidanlik.fidanysserver.user.repository.UserRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.tenant.repository.TenantRepository; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        if (request.getTenantName() == null || request.getTenantName().trim().isEmpty()) {
            throw new BadCredentialsException("Şirket adı (tenantName) eksik.");
        }

        Tenant tenant = tenantRepository.findByName(request.getTenantName())
                .orElseThrow(() -> new BadCredentialsException("Bilinmeyen şirket adı: " + request.getTenantName()));

        if (!tenant.isActive()) {
            throw new BadCredentialsException("Şirket hesabı aktif değil: " + request.getTenantName());
        }

        String actualTenantId = tenant.getId();

        Authentication authentication = authenticationManager.authenticate(
                new TenantAuthenticationToken(
                        request.getUsername(),
                        request.getPassword(),
                        actualTenantId
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        var user = userRepository.findByUsernameAndTenantId(request.getUsername(), actualTenantId)
                .orElseThrow(() -> new IllegalStateException("Kimlik doğrulama sonrası kullanıcı bulunamadı."));

        var jwtToken = jwtService.generateToken(user);
        return LoginResponse.builder().token(jwtToken).build();
    }
}