package com.safekab.market.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.safekab.market.entity.Role;
import com.safekab.market.entity.RoleName;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName roleName);
}
