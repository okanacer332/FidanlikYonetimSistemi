package com.fidanlik.fysserver.config.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class TenantAuthenticationToken extends UsernamePasswordAuthenticationToken {

    private final String tenantId;

    public TenantAuthenticationToken(Object principal, Object credentials, String tenantId) {
        super(principal, credentials);
        this.tenantId = tenantId;
    }

    public TenantAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities, String tenantId) {
        super(principal, credentials, authorities);
        this.tenantId = tenantId;
    }

    public String getTenantId() {
        return tenantId;
    }
}