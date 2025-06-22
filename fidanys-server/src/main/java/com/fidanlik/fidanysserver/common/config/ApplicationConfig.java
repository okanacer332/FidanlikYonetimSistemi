package com.fidanlik.fidanysserver.common.config;

import com.fidanlik.fidanysserver.common.security.TenantAwareUserDetailsService;
import com.fidanlik.fidanysserver.common.security.TenantAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final TenantAwareUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public TenantAuthenticationProvider tenantAuthenticationProvider() {
        return new TenantAuthenticationProvider(userDetailsService, passwordEncoder());
    }

    // BU BEAN'İ KALDIRIYORUZ!
    // @Bean
    // public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    //     return config.getAuthenticationManager();
    // }
}