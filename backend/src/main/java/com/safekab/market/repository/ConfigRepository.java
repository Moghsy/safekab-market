package com.safekab.market.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.safekab.market.entity.Config;

@Repository
public interface ConfigRepository extends JpaRepository<Config, Long> {

}
