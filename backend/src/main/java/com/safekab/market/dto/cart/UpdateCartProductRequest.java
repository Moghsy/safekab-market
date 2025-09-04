package com.safekab.market.dto.cart;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateCartProductRequest {

    @NotNull(message = "must provide a product id")
    private Long productId;
    @NotNull(message = "must provide a quantity")
    @Positive(message = "must provide a positive quantity")
    @Max(value = 100, message = "must provide a quantity less than or equal to 100")
    private Integer quantity;
}
