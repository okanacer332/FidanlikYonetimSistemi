package com.fidanlik.fysserver.config.security;

import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.repository.RoleRepository;
import com.fidanlik.fysserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService, TenantAwareUserDetailsService { // TenantAwareUserDetailsService'i implement ettik

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Bu metod standart UserDetailsService arayüzünden gelir ve tenantId alamaz.
        // Bu yüzden burada genel bir hata fırlatabiliriz veya varsayılan bir tenantId ile deneme yapabiliriz.
        // Ancak bu multi-tenant uygulamalar için ideal değildir.
        // AuthenticationProvider'ımız loadUserByUsernameAndTenantId metodumuzu çağıracak.
        throw new UnsupportedOperationException("Tenant ID olmadan kullanıcı doğrulama desteklenmiyor. Lütfen TenantAwareAuthenticationProvider kullanın.");
    }

    @Override
    public UserDetails loadUserByUsernameAndTenantId(String username, String tenantId) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameAndTenantId(username, tenantId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı veya yanlış şirket kimliği: " + username));

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

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}