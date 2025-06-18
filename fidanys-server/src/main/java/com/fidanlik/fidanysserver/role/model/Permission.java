package com.fidanlik.fidanysserver.role.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "permissions")
public class Permission {
    @Id
    private String id;
    private String name;
    private String description;
    private String tenantId;
}