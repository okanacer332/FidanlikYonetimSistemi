// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/security/UserDetailsServiceImpl.java
package com.fidanlik.fidanysserver.common.security; // PAKET YOLUNU BU ŞEKİLDE DÜZELTİN

import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu
import com.fidanlik.fidanysserver.role.repository.RoleRepository; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.repository.UserRepository; // Yeni paket yolu
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
import java.util.Optional; // Optional importu
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

    @Override // TenantAwareUserDetailsService arayüzünden gelen metod
    public UserDetails loadUserByUsernameAndTenantId(String username, String tenantId) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameAndTenantId(username, tenantId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı veya yanlış şirket kimliği: " + username));

        // Kullanıcının rollerini doldur
        Set<GrantedAuthority> authorities;
        if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            // Roller DBRef olduğu için manuel dolduralım
            Set<com.fidanlik.fidanysserver.role.model.Role> roles = user.getRoleIds().stream()
                    .map(roleRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            user.setRoles(roles); // User objesinin roles alanını doldur

            authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
                    .collect(Collectors.toSet());
        } else {
            authorities = Collections.emptySet();
            user.setRoles(Collections.emptySet()); // Roles alanını boş set et
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}