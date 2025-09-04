package com.safekab.market.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.safekab.market.entity.Config;
import com.safekab.market.repository.ConfigRepository;

@Service
public class ConfigService {
    private final ConfigRepository configRepository;

    public ConfigService(ConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    @Transactional(readOnly = true)
    public Config getConfig() {
        return configRepository.findAll().stream().findFirst().orElse(null);
    }

    @Transactional
    public Config saveConfig(Config config) {
        return configRepository.save(config);
    }
}
