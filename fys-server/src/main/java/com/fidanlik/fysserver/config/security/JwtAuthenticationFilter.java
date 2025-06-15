package com.fidanlik.fysserver.config.security;

import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.RoleRepository;
import com.fidanlik.fysserver.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // Bu yerine TenantAuthenticationToken kullanacağız
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        final String tenantId = jwtService.extractTenantId(jwt); // tenantId'yi token'dan çıkar

        if (username != null && tenantId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            userRepository.findByUsernameAndTenantId(username, tenantId).ifPresent(user -> {

                Set<GrantedAuthority> authorities;
                if (user.getRoleIds() != null) {
                    authorities = user.getRoleIds().stream()
                            .map(roleId -> roleRepository.findById(roleId).orElse(null))
                            .filter(Objects::nonNull)
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
                            .collect(Collectors.toSet());
                } else {
                    authorities = Collections.emptySet();
                }

                // JwtService.isTokenValid() metodu UserDetails objesini bekliyor.
                // Burada UserDetails'i oluşturup token geçerliliğini kontrol edelim.
                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        authorities
                );

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // TenantAuthenticationToken kullanarak User objesini principal olarak set et
                    TenantAuthenticationToken authToken = new TenantAuthenticationToken(
                            user, // Principal olarak User objesini koyuyoruz
                            null, // Credentials'a gerek yok çünkü zaten JWT ile doğrulandı
                            userDetails.getAuthorities(),
                            user.getTenantId() // tenantId'yi de token'a ekliyoruz
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            });
        }
        filterChain.doFilter(request, response);
    }
}