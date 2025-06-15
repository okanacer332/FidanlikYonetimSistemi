// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/config/ApplicationConfig.java
package com.fidanlik.fidanysserver.common.config;

import com.fidanlik.fidanysserver.common.security.TenantAwareUserDetailsService; // Yeni paket yolu
import com.fidanlik.fidanysserver.common.security.TenantAuthenticationProvider; // Yeni paket yolu
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; // Bu import'a artık gerek yok
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

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}