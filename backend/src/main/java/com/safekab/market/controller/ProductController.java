package com.safekab.market.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.dto.product.NewProductRequest;
import com.safekab.market.dto.product.ProductResponse;
import com.safekab.market.dto.product.ProductResponseItem;
import com.safekab.market.dto.product.UpdateProductRequest;
import com.safekab.market.entity.Product;
import com.safekab.market.exception.ApiException;
import com.safekab.market.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<ProductResponse> getAllProducts() {
        return ResponseEntity.ok(new ProductResponse(productService.getAllProducts()));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponseItem> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(new ProductResponseItem(product));
    }

    @PostMapping("/admin/products")
    public ResponseEntity<Void> postProduct(@Valid @RequestBody NewProductRequest productRequest) {
        productService.createProduct(productRequest);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/products")
    public ResponseEntity<Void> patchProduct(@Valid @RequestBody UpdateProductRequest productRequest) {
        productService.updateProduct(productRequest);
        return ResponseEntity.noContent().build();
    }

}
