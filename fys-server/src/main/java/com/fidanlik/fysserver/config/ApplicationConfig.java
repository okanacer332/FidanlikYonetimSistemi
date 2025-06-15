package com.fidanlik.fysserver.config;

import com.fidanlik.fysserver.config.security.TenantAwareUserDetailsService;
import com.fidanlik.fysserver.config.security.TenantAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; // Yeni import
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

    // TenantAuthenticationProvider bean'ini burada tanımlıyoruz
    @Bean
    public TenantAuthenticationProvider tenantAuthenticationProvider() { // Metot adını değiştirdik
        return new TenantAuthenticationProvider(userDetailsService, passwordEncoder());
    }

    // AuthenticationManager'ın doğru provider'ı kullanmasını sağlayalım
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Doğrudan AuthenticationConfiguration'ın getAuthenticationManager'ını kullanarak
        // Spring'in tüm mevcut AuthenticationProvider'ları bulup kullanmasını sağlıyoruz.
        // Spring Boot 2.x'te @Autowired ile AuthenticationManagerBuilder'ı kullanırken daha açık bir şekilde
        // provider ekleyebiliyorduk. Spring Boot 3.x'te bu yapılandırma biraz değişti.
        // TenantAuthenticationProvider'ı bir Bean olarak tanımladığımız için, Spring bunu otomatik olarak
        // AuthenticationManager'a eklemelidir.

        // Eğer hala hata alırsak, AuthenticationManager'ı daha manuel yapılandırmamız gerekebilir:
        // AuthenticationManagerBuilder builder = config.getSharedObject(AuthenticationManagerBuilder.class);
        // builder.authenticationProvider(tenantAuthenticationProvider()); // Kendi provider'ımızı ekle
        // return builder.build();

        return config.getAuthenticationManager();
    }
}