package com.safekab.market.repository.cart;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.safekab.market.entity.Product;
import com.safekab.market.entity.cart.Cart;
import com.safekab.market.entity.cart.CartProduct;

@Repository
public interface CartProductRepository extends JpaRepository<CartProduct, Long> {

    Set<CartProduct> findByCart(Cart cart);

    Optional<CartProduct> findByCartAndProduct(Cart cart, Product product);

}
