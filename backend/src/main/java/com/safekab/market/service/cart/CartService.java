package com.safekab.market.service.cart;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.safekab.market.entity.Product;
import com.safekab.market.entity.User;
import com.safekab.market.entity.cart.Cart;
import com.safekab.market.entity.cart.CartProduct;
import com.safekab.market.exception.ApiException;
import com.safekab.market.repository.ProductRepository;
import com.safekab.market.repository.UserRepository;
import com.safekab.market.repository.cart.CartProductRepository;
import com.safekab.market.repository.cart.CartRepository;

@Service
public class CartService {

  @Autowired
  private CartRepository cartRepository;
  @Autowired
  private ProductRepository productRepository;
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private CartProductRepository cartProductRepository;

  public Cart getCartByUser(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return cartRepository.findByUser(user).orElseGet(() -> {
      Cart newCart = new Cart();
      newCart.setUser(user);
      return cartRepository.save(newCart);
    });
  }

  public Cart deltaProductQuantity(Long userId, Long productId, Integer delta) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
      Cart newCart = new Cart();
      newCart.setUser(user);
      return cartRepository.save(newCart);
    });
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    CartProduct cartProduct = cartProductRepository.findByCartAndProduct(cart, product)
        .orElseGet(() -> {
          CartProduct newCartProduct = new CartProduct();
          newCartProduct.setCart(cart);
          newCartProduct.setProduct(product);
          newCartProduct.setQuantity(0);
          return cartProductRepository.save(newCartProduct);
        });
    if (cartProduct.getQuantity() + delta < 1) {
      cartProductRepository.delete(cartProduct);
    } else {
      cartProduct.setQuantity(cartProduct.getQuantity() + delta);
      cartProductRepository.save(cartProduct);
    }
    return cart;
  }

  public Cart updateProductQuantity(Long userId, Long productId, Integer quantity) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
      Cart newCart = new Cart();
      newCart.setUser(user);
      return cartRepository.save(newCart);
    });
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    CartProduct cartProduct = cartProductRepository.findByCartAndProduct(cart, product)
        .orElseGet(() -> {
          CartProduct newCartProduct = new CartProduct();
          newCartProduct.setCart(cart);
          newCartProduct.setProduct(product);
          newCartProduct.setQuantity(0);
          return cartProductRepository.save(newCartProduct);
        });
    if (quantity < 1) {
      cartProductRepository.delete(cartProduct);
    } else {
      cartProduct.setQuantity(quantity);
      cartProductRepository.save(cartProduct);
    }
    return cart;
  }

  public void removeProductFromCart(Long userId, Long productId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    CartProduct cartProduct = cartProductRepository.findByCartAndProduct(cart, product)
        .orElseThrow(() -> new ApiException("CartProduct not found", HttpStatus.NOT_FOUND));
    cartProductRepository.delete(cartProduct);
  }

  public void removeProductsFromCart(Long userId, List<Long> productIds) {
    try {
      User user = userRepository.findById(userId)
          .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
      Cart cart = cartRepository.findByUser(user)
          .orElseThrow(() -> new ApiException("Cart not found", HttpStatus.NOT_FOUND));
      for (Long productId : productIds) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ApiException("Product not found",
                HttpStatus.NOT_FOUND));
        cartProductRepository.findByCartAndProduct(cart, product)
            .ifPresent(cartProductRepository::delete);
      }
    } catch (ApiException e) {
      throw e;
    } catch (Exception e) {
    }
  }

}
