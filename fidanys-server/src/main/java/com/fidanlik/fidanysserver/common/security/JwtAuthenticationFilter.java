package com.fidanlik.fidanysserver.common.security;

import com.fidanlik.fidanysserver.role.model.Role;
import com.fidanlik.fidanysserver.role.repository.RoleRepository;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.user.repository.UserRepository;
import com.fidanlik.fidanysserver.user.repository.UserTokenRepository;
import com.fidanlik.fidanysserver.user.model.UserToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserTokenRepository userTokenRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // --- DEĞİŞİKLİK BURADA ---
        // Artık sadece /login isteğini atlıyoruz. /logout ve diğerleri token kontrolünden geçecek.
        if (request.getRequestURI().equals("/api/v1/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        final String tenantId = jwtService.extractTenantId(jwt);

        if (username != null && tenantId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            userRepository.findByUsernameAndTenantId(username, tenantId).ifPresent(user -> {
                Optional<UserToken> dbToken = userTokenRepository.findByUserIdAndTenantId(user.getId(), tenantId);

                // --- GÜNCEL ÇÖZÜM: TOKEN KONTROLÜ ---
                // Gelen JWT, veritabanında saklanan token ile birebir eşleşmeli.
                // Eğer veritabanında token yoksa veya tokenlar eşleşmiyorsa, bu bir güvenlik açığıdır.
                if (dbToken.isEmpty() || !dbToken.get().getToken().equals(jwt)) {
                    System.out.println("GELEN JWT, VERİTABANINDAKİ TOKEN İLE EŞLEŞMİYOR! OTURUM SONLANDIRILIYOR -> Kullanıcı: " + user.getUsername());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
                    Set<Role> roles = user.getRoleIds().stream()
                            .map(roleRepository::findById)
                            .filter(Optional::isPresent)
                            .map(Optional::get)
                            .collect(Collectors.toSet());
                    user.setRoles(roles);
                } else {
                    user.setRoles(Collections.emptySet());
                }

                if (jwtService.isTokenValid(jwt, user)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            });
        }
        filterChain.doFilter(request, response);
    }
}
