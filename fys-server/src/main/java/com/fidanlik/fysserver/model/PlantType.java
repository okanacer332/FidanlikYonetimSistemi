package com.fidanlik.fysserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plantTypes") // MongoDB koleksiyon adı
public class PlantType {
    @Id
    private String id; // Otomatik oluşturulan benzersiz ID

    @Indexed(unique = true) // 'name' alanı benzersiz ve indeksli olsun
    private String name; // Fidan türünün adı (örn: Elma, Kiraz)

    private String tenantId; // Hangi şirkete ait olduğu
}