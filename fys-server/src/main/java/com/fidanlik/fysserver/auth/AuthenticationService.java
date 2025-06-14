package com.fidanlik.fysserver.auth;

import com.fidanlik.fysserver.auth.dto.LoginRequest;
import com.fidanlik.fysserver.auth.dto.LoginResponse;
import com.fidanlik.fysserver.config.security.JwtService;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager; // AuthenticationManager'ı enjekte et

    public LoginResponse login(LoginRequest request) {
        // Spring Security'nin kimlik doğrulama mekanizmasını kullan
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Kullanıcıyı veritabanından tekrar al (rolleriyle birlikte)
        var user = userRepository.findByUsernameAndTenantId(request.getUsername(), request.getTenantId())
                .orElseThrow(() -> new IllegalStateException("Kimlik doğrulama sonrası kullanıcı bulunamadı."));

        var jwtToken = jwtService.generateToken(user);
        return LoginResponse.builder().token(jwtToken).build();
    }
}