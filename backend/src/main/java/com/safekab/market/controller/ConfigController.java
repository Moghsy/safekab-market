package com.safekab.market.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.entity.Config;
import com.safekab.market.service.ConfigService;

@RestController
@RequestMapping("/api")
public class ConfigController {
    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    @GetMapping("/config")
    public ResponseEntity<Config> getConfig() {
        Config config = configService.getConfig();
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }

    @PostMapping("/admin/config")
    public ResponseEntity<Config> saveConfig(@RequestBody Config config) {
        Config saved = configService.saveConfig(config);
        return ResponseEntity.ok(saved);
    }
}
