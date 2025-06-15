// Yeni konum: src/main/java/com/fidanlik/fidanysserver/common/config/MongoCascadeListener.java
package com.fidanlik.fidanysserver.common.config;

import com.fidanlik.fidanysserver.user.model.User; // Yeni paket yolu
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterConvertEvent;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;

import java.util.Collection;

@Component
public class MongoCascadeListener extends AbstractMongoEventListener<Object> {

    @Autowired
    private MongoOperations mongoOperations;

    @Override
    public void onAfterConvert(AfterConvertEvent<Object> event) {
        Object source = event.getSource();
        ReflectionUtils.doWithFields(source.getClass(), field -> {
            ReflectionUtils.makeAccessible(field);

            if (field.isAnnotationPresent(DBRef.class)) {
                Object fieldValue = field.get(source);
                if (fieldValue instanceof Collection) {
                    ((Collection<?>) fieldValue).forEach(item -> {
                        // DBRef'leri manuel olarak yükle
                        if(item instanceof com.mongodb.DBRef) {
                            // Bu bloğa normalde girmemesi lazım ama eski versiyonlar için bir kontrol
                        } else if (item instanceof User) {
                            // Özyinelemeli durumları engellemek için kontrol
                        }
                    });
                }
            }
        });

        super.onAfterConvert(event);
    }
}