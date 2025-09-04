package com.safekab.market.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.safekab.market.entity.Product;
import com.safekab.market.entity.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    void deleteAllByProduct(Product product);
}
