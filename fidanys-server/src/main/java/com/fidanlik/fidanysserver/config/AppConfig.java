package com.fidanlik.fidanysserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // Spring context'ine bir RestTemplate nesnesi ekler.
    // Bu sayede @Autowired veya constructor injection ile başka sınıflarda kullanabiliriz.
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}