package com.safekab.market.dto.order;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.dto.product.ProductResponseItem;
import com.safekab.market.entity.OrderProduct;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OrderProductResponse {
    private ProductResponseItem product;
    private Integer quantity;

    public OrderProductResponse(OrderProduct orderProduct) {
        this.product = new ProductResponseItem(orderProduct.getProduct());
        this.quantity = orderProduct.getQuantity();
    }
}
