package com.safekab.market.dto.cart;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AddOrRemoveCartProductRequest {
    @NotNull
    private Long productId;

    @Max(100)
    @Min(-100)
    private Integer quantity;

}
