// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/customer/model/Customer.java
package com.fidanlik.fidanysserver.customer.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String companyName;
    private String phone;
    private String email;
    private String address;
    private String tenantId;
}