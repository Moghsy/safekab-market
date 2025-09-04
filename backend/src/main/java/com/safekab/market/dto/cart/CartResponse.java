package com.safekab.market.dto.cart;

import java.util.Set;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.cart.Cart;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CartResponse {

    private final Long cartId;
    private final Set<CartProductResponseItem> products;

    public CartResponse(Cart cart) {
        this.cartId = cart.getId();
        this.products = cart.getCartProducts().stream()
                .map(cp -> new CartProductResponseItem(
                        cp.getProduct().getId(),
                        cp.getProduct().getName(),
                        cp.getProduct().getDescription(),
                        cp.getProduct().getNetPrice(),
                        cp.getProduct().getVatRate(),
                        cp.getProduct().getStock(),
                        cp.getQuantity()))

                .collect(java.util.stream.Collectors.toSet());
    }

    public CartResponse(Long cartId, Set<CartProductResponseItem> products) {
        this.cartId = cartId;
        this.products = products;
    }

    public Long getCartId() {
        return cartId;
    }

    public Set<CartProductResponseItem> getProducts() {
        return products;
    }
}
