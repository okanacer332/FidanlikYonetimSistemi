package com.fidanlik.fysserver.auth;

import com.fidanlik.fysserver.auth.dto.LoginRequest;
import com.fidanlik.fysserver.auth.dto.LoginResponse;
import com.fidanlik.fysserver.config.security.JwtService;
import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        var user = userRepository.findByUsernameAndTenantId(request.getUsername(), request.getTenantId())
                .orElseThrow(() -> new BadCredentialsException("Hatalı kullanıcı adı veya şifre."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Hatalı kullanıcı adı veya şifre.");
        }

        var jwtToken = jwtService.generateToken(user);
        return LoginResponse.builder().token(jwtToken).build();
    }
}