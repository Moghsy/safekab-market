package com.safekab.market.dto.product;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.Product;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProductRequest {
    @NotNull(message = "Product ID is required")
    @PositiveOrZero
    private Long id;
    private String name;
    private String description;
    private Long netPrice;
    private Integer vatRate;
    private Integer stock;

    public ProductRequest(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.netPrice = product.getNetPrice();
        this.vatRate = product.getVatRate();
        this.stock = product.getStock();
    }
}
