// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/security/TenantAuthenticationProvider.java
package com.fidanlik.fidanysserver.common.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // BU SATIRI EKLEYİN
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
        setPasswordEncoder(passwordEncoder);
        setUserDetailsService((UserDetailsService) userDetailsService);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String tenantId = null;
        if (authentication instanceof TenantAuthenticationToken) {
            tenantId = ((TenantAuthenticationToken) authentication).getTenantId();
        } else {
            throw new BadCredentialsException("Geçersiz kimlik doğrulama token tipi veya Tenant ID eksik.");
        }

        String username = authentication.getPrincipal().toString();
        String password = authentication.getCredentials().toString();

        UserDetails userDetails = userDetailsService.loadUserByUsernameAndTenantId(username, tenantId);

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Yanlış parola.");
        }

        return new TenantAuthenticationToken(
                userDetails,
                userDetails.getPassword(),
                userDetails.getAuthorities(),
                tenantId
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return TenantAuthenticationToken.class.isAssignableFrom(authentication);
    }
}