package com.safekab.market.repository.cart;

import com.safekab.market.entity.cart.Cart;
import com.safekab.market.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
