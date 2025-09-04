package com.safekab.market.controller.cart;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.dto.cart.AddOrRemoveCartProductRequest;
import com.safekab.market.dto.cart.CartResponse;
import com.safekab.market.dto.cart.RemoveCartProductsRequest;
import com.safekab.market.dto.cart.UpdateCartProductRequest;
import com.safekab.market.entity.cart.Cart;
import com.safekab.market.service.cart.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal Long userId) {
        Cart cart = cartService.getCartByUser(userId);
        return new CartResponse(cart);
    }

    @PostMapping
    public ResponseEntity<Void> addProductToCart(@AuthenticationPrincipal Long userId,
            @Valid @RequestBody AddOrRemoveCartProductRequest request) {
        cartService.deltaProductQuantity(userId, request.getProductId(), request.getQuantity());
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<Void> updateProductQuantity(@AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateCartProductRequest request) {
        cartService.updateProductQuantity(userId, request.getProductId(), request.getQuantity());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> removeProductsFromCart(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody RemoveCartProductsRequest request) {
        cartService.removeProductsFromCart(userId, request.getProducts());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeProductFromCart(@AuthenticationPrincipal Long userId,
            @PathVariable Long productId) {
        cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
