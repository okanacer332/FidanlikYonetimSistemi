package com.fidanlik.fysserver.config.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class TenantAuthenticationProvider extends DaoAuthenticationProvider {

    private final TenantAwareUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public TenantAuthenticationProvider(TenantAwareUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        setPasswordEncoder(passwordEncoder); // DaoAuthenticationProvider'ın passwordEncoder'ını set et
        setUserDetailsService((UserDetailsService) userDetailsService); // DaoAuthenticationProvider'ın UserDetailsService'ini set et
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String tenantId = null;
        if (authentication instanceof TenantAuthenticationToken) {
            tenantId = ((TenantAuthenticationToken) authentication).getTenantId();
        } else {
            // Eğer TenantAuthenticationToken değilse ve tenantId'ye ihtiyacımız varsa hata fırlatabiliriz.
            // Bu genellikle olmamalı çünkü AuthenticationService her zaman TenantAuthenticationToken göndermeli.
            throw new BadCredentialsException("Geçersiz kimlik doğrulama token tipi veya Tenant ID eksik.");
        }

        String username = authentication.getPrincipal().toString();
        String password = authentication.getCredentials().toString();

        UserDetails userDetails = userDetailsService.loadUserByUsernameAndTenantId(username, tenantId);

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Yanlış parola.");
        }

        // Kimlik doğrulama başarılı ise yeni bir TenantAuthenticationToken döndür
        return new TenantAuthenticationToken(
                userDetails,
                userDetails.getPassword(),
                userDetails.getAuthorities(),
                tenantId
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        // Bu provider'ın sadece TenantAuthenticationToken'ı desteklediğini belirtiyoruz
        return TenantAuthenticationToken.class.isAssignableFrom(authentication);
    }
}