// Yeni konum: src/main/java/com/fidanlik/fidanysserver/auth/service/AuthenticationService.java
package com.fidanlik.fidanysserver.auth.service;

import com.fidanlik.fidanysserver.auth.dto.LoginRequest;
import com.fidanlik.fidanysserver.auth.dto.LoginResponse;
import com.fidanlik.fidanysserver.common.security.JwtService;
import com.fidanlik.fidanysserver.common.security.TenantAuthenticationToken;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.tenant.model.Tenant;
import com.fidanlik.fidanysserver.user.repository.UserRepository;
import com.fidanlik.fidanysserver.tenant.repository.TenantRepository;
import com.fidanlik.fidanysserver.user.model.UserToken;
import com.fidanlik.fidanysserver.user.repository.UserTokenRepository;
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
    private final UserTokenRepository userTokenRepository;

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

        var user = userRepository.findByUsernameAndTenantId(request.getUsername(), actualTenantId)
                .orElseThrow(() -> new BadCredentialsException("Kimlik doğrulama başarısız."));

        // YENİ KONTROL: Kullanıcının zaten aktif bir tokenı var mı?
        // Bu, çalınan şifre ile yapılan 2. girişi engeller.
        if (userTokenRepository.findByUserIdAndTenantId(user.getId(), actualTenantId).isPresent()) {
            throw new BadCredentialsException("Bu hesapta zaten aktif bir oturum bulunmaktadır.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new TenantAuthenticationToken(
                        request.getUsername(),
                        request.getPassword(),
                        actualTenantId
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        var jwtToken = jwtService.generateToken(user);

        // Tokenı veritabanına kaydetme
        UserToken userToken = new UserToken();
        userToken.setUserId(user.getId());
        userToken.setToken(jwtToken);
        userToken.setTenantId(actualTenantId);
        userTokenRepository.save(userToken);

        return LoginResponse.builder().token(jwtToken).build();
    }

    // YENİ METOT: Kullanıcının veritabanındaki token kaydını siler.
    public void logout(User user) {
        // Kullanıcının ID'si ve Tenant ID'si ile veritabanındaki token'ı bul ve sil.
        userTokenRepository.findByUserIdAndTenantId(user.getId(), user.getTenantId()).ifPresent(userTokenRepository::delete);
    }
}
