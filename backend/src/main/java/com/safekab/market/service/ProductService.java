package com.safekab.market.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.safekab.market.dto.product.NewProductRequest;
import com.safekab.market.dto.product.ProductMediaRequest;
import com.safekab.market.dto.product.UpdateProductRequest;
import com.safekab.market.entity.Product;
import com.safekab.market.entity.ProductImage;
import com.safekab.market.exception.ApiException;
import com.safekab.market.repository.ProductImageRepository;
import com.safekab.market.repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public void createProduct(NewProductRequest productRequest) {
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setStock(productRequest.getStock());
        product.setDescription(productRequest.getDescription());
        product.setNetPrice(productRequest.getNetPrice());
        product.setVatRate(productRequest.getVatRate());
        product.setCurrency(productRequest.getCurrency());

        try {
            Product savedProduct = productRepository.save(product);

            // Handle media if provided
            if (productRequest.getMedia() != null && !productRequest.getMedia().isEmpty()) {
                List<ProductImage> images = new ArrayList<>();
                for (ProductMediaRequest mediaRequest : productRequest.getMedia()) {
                    ProductImage image = new ProductImage();
                    image.setProduct(savedProduct);
                    image.setImageUrl(mediaRequest.getImageUrl());
                    image.setAltText(mediaRequest.getAltText());
                    image.setDisplayOrder(mediaRequest.getDisplayOrder());
                    image.setMediaType(mediaRequest.getMediaType());
                    images.add(image);
                }
                productImageRepository.saveAll(images);
            }

        } catch (DataIntegrityViolationException ex) {
            throw new ApiException("Duplicate product name or other unique constraint violation", HttpStatus.CONFLICT);
        }
    }

    @Transactional
    public void updateProduct(UpdateProductRequest productRequest) {
        Product product = productRepository
                .findById(productRequest.getId())
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        if (productRequest.getName() != null && !productRequest.getName().isEmpty()) {
            product.setName(productRequest.getName());
        }
        if (productRequest.getDescription() != null && !productRequest.getDescription().isEmpty()) {
            product.setDescription(productRequest.getDescription());
        }
        if (productRequest.getNetPrice() != null && productRequest.getNetPrice() >= 0) {
            product.setNetPrice(productRequest.getNetPrice());
        }
        if (productRequest.getStock() != null && productRequest.getStock() >= 0) {
            product.setStock(productRequest.getStock());
        }
        if (productRequest.getCurrency() != null && !productRequest.getCurrency().isEmpty()) {
            product.setCurrency(productRequest.getCurrency());
        }
        if (productRequest.getVatRate() != null && productRequest.getVatRate() >= 0) {
            product.setVatRate(productRequest.getVatRate());
        }

        // Handle media updates
        if (productRequest.getMedia() != null) {
            // Remove existing images
            if (product.getImages() != null) {
                productImageRepository.deleteAllByProduct(product);
            }

            // Add new images
            List<ProductImage> newImages = new ArrayList<>();
            for (ProductMediaRequest mediaRequest : productRequest.getMedia()) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(mediaRequest.getImageUrl());
                image.setAltText(mediaRequest.getAltText());
                image.setDisplayOrder(mediaRequest.getDisplayOrder());
                image.setMediaType(mediaRequest.getMediaType());
                newImages.add(image);
            }
            productImageRepository.saveAll(newImages);
        }

        productRepository.save(product);
    }
}
