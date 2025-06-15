// Yeni konum: src/main/java/com/fidanlik/fidanysserver/tenant/model/Tenant.java
package com.fidanlik.fidanysserver.tenant.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data @Document(collection = "tenants")
public class Tenant {
    @Id private String id;
    @Indexed(unique = true) private String name;
    private boolean active;
}