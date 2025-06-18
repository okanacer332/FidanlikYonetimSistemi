package com.fidanlik.fidanysserver.common.security;

import com.fidanlik.fidanysserver.role.model.Role;
import com.fidanlik.fidanysserver.role.repository.RoleRepository;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// DÜZELTME: Hem UserDetailsService'i hem de TenantAwareUserDetailsService'i tekrar implemente ediyoruz.
public class UserDetailsServiceImpl implements UserDetailsService, TenantAwareUserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Bu metot, standart Spring arayüzü için gereklidir ancak bizim tenant'lı yapımızda
        // doğrudan kullanılmamalıdır. Bu yüzden hata fırlatması doğrudur.
        throw new UnsupportedOperationException("Tenant ID olmadan kullanıcı doğrulama desteklenmiyor.");
    }

    @Override
    @Transactional(readOnly = true)
    // DÜZELTME: TenantAuthenticationProvider tarafından kullanılan bu metodu geri ekliyoruz.
    public UserDetails loadUserByUsernameAndTenantId(String username, String tenantId) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameAndTenantId(username, tenantId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı veya yanlış şirket kimliği: " + username));

        // Kullanıcının rollerini veritabanından çekip User nesnesine ekliyoruz.
        // Bu, getAuthorities() metodunun doğru çalışması için kritik öneme sahiptir.
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

        // Bizim User modelimiz zaten UserDetails'i implemente ettiği için,
        // onu doğrudan döndürebiliriz.
        return user;
    }
}