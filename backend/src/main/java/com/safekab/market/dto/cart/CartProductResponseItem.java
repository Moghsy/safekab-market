package com.safekab.market.dto.cart;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CartProductResponseItem {

    private final Long productId;
    private final String name;
    private final String description;
    private final Long netPrice;
    private final Integer vatRate;
    private final Integer stock;
    private final Integer quantity;

    public CartProductResponseItem(Long productId, String name, String description, Long netPrice, Integer vatRate,
            Integer stock,
            Integer quantity) {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.netPrice = netPrice;
        this.vatRate = vatRate;
        this.stock = stock;
        this.quantity = quantity;
    }
}
