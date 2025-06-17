// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/supplier/model/Supplier.java
package com.fidanlik.fidanysserver.supplier.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "suppliers")
@CompoundIndex(def = "{'name': 1, 'tenantId': 1}", unique = true)
public class Supplier {
    @Id
    private String id;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String tenantId;
}