package com.safekab.market.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.safekab.market.entity.Config;
import com.safekab.market.repository.ConfigRepository;

@Configuration
public class ConfigInitializer {
    @Bean
    public CommandLineRunner initConfig(ConfigRepository configRepository) {
        return args -> {
            if (configRepository.count() == 0) {
                Config config = new Config();
                config.setVat(1.2);
                config.setShippingCost(500L); // £5.00 in pence
                configRepository.save(config);
            }
        };
    }
}
