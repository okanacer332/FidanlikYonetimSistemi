package com.fidanlik.fysserver.config;

import com.fidanlik.fysserver.config.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; // CorsConfiguration sınıfını içe aktar
import org.springframework.web.cors.CorsConfigurationSource; // CorsConfigurationSource arayüzünü içe aktar
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // UrlBasedCorsConfigurationSource sınıfını içe aktar

import java.util.Arrays; // Arrays sınıfını içe aktar

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF korumasını devre dışı bırak
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS yapılandırmasını etkinleştir
                .authorizeHttpRequests(auth -> auth
                        // Kimlik doğrulama uç noktalarına herkesin erişimine izin ver
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // GraphQL endpoint'ine herkesin erişimine izin ver (eğer hala kullanılıyorsa)
                        .requestMatchers("/graphql").permitAll()
                        // Diğer tüm isteklere kimlik doğrulaması gereksin
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Oturum yönetimini stateless yap
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // JWT filtreyi ekle

        return http.build();
    }

    // CORS Configuration Bean'i
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Frontend'in çalıştığı URL'i buraya ekle. Next.js dev server'ı genellikle 3000 portunda çalışır.
        // Birden fazla frontend kaynağı varsa buraya ekleyebilirsin.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        // İzin verilen HTTP metotları
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // İzin verilen HTTP başlıkları
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Kimlik bilgileri (çerezler, HTTP kimlik doğrulama başlıkları) gönderilmesine izin ver
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Tüm path'ler için CORS yapılandırmasını uygula
        return source;
    }
}