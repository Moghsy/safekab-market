package com.safekab.market.dto.product;

import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.Product;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProductResponse {
    private List<ProductResponseItem> products;

    public ProductResponse(List<Product> products) {
        this.products = products.stream()
                .map(ProductResponseItem::new)
                .collect(Collectors.toList());
    }

    public ProductResponse(Product product) {
        this.products = List.of(new ProductResponseItem(product));
    }

    public List<ProductResponseItem> getProducts() {
        return products;
    }

    public void setProducts(List<ProductResponseItem> products) {
        this.products = products;
    }

}
