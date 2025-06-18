package com.fidanlik.fidanysserver.user.model;

import com.fidanlik.fidanysserver.role.model.Role;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Document(collection = "users")
// DÜZELTME: Spring Security'nin UserDetails arayüzünü implemente ediyoruz.
public class User implements UserDetails {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Set<String> roleIds;

    private String tenantId;

    @Transient
    private Set<Role> roles;

    // --- UserDetails Arayüzünden Gelen Metotlar ---

    @Override
    @Transient // Bu alanın veritabanına kaydedilmesini engeller
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptyList();
        }
        // Rol isimlerini Spring Security'nin anlayacağı formata çeviriyoruz (örn: "Yönetici" -> "ROLE_YÖNETİCİ")
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // Bu metotları şimdilik varsayılan olarak 'true' döndürecek şekilde bırakıyoruz.
    // İleride kullanıcı kilitleme, hesabın süresinin dolması gibi özellikler eklemek isterseniz,
    // User modelinize yeni alanlar (örn: boolean isEnabled) ekleyip bu metotların mantığını değiştirebilirsiniz.
    @Override
    @Transient
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @Transient
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @Transient
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @Transient
    public boolean isEnabled() {
        return true;
    }
}