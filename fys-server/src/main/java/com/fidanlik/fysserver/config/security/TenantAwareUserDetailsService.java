package com.fidanlik.fysserver.config.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface TenantAwareUserDetailsService {
    UserDetails loadUserByUsernameAndTenantId(String username, String tenantId) throws UsernameNotFoundException;
}