// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/security/TenantAwareUserDetailsService.java
package com.fidanlik.fidanysserver.common.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface TenantAwareUserDetailsService {
    UserDetails loadUserByUsernameAndTenantId(String username, String tenantId) throws UsernameNotFoundException;
}