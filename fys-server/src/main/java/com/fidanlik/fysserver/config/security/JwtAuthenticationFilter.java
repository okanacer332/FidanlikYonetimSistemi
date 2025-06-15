package com.fidanlik.fysserver.config.security;

import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.model.Role; // Role modelini import et
import com.fidanlik.fysserver.repository.RoleRepository;
import com.fidanlik.fysserver.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
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
import java.util.Optional; // Optional importu
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
        final String tenantId = jwtService.extractTenantId(jwt);

        if (username != null && tenantId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            userRepository.findByUsernameAndTenantId(username, tenantId).ifPresent(user -> {

                // Kullanıcının rollerini doldur
                Set<GrantedAuthority> authorities;
                if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
                    Set<Role> roles = user.getRoleIds().stream()
                            .map(roleRepository::findById)
                            .filter(Optional::isPresent)
                            .map(Optional::get)
                            .collect(Collectors.toSet());
                    user.setRoles(roles); // User objesinin roles alanını doldur

                    authorities = roles.stream() // Doldurulmuş rollerden GrantedAuthority oluştur
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
                            .collect(Collectors.toSet());
                } else {
                    authorities = Collections.emptySet();
                    user.setRoles(Collections.emptySet()); // Roles alanını boş set et
                }

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        authorities
                );

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    TenantAuthenticationToken authToken = new TenantAuthenticationToken(
                            user,
                            null,
                            userDetails.getAuthorities(),
                            user.getTenantId()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            });
        }
        filterChain.doFilter(request, response);
    }
}