package com.safekab.market.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.safekab.market.entity.Role;
import com.safekab.market.entity.RoleName;
import com.safekab.market.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                return roleRepository.save(new Role(roleName));
            });
        }
    }
}
