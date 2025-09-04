package com.safekab.market.dto.product;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateProductRequest {
    @NotNull(message = "Product ID is required")
    @PositiveOrZero
    private Long id;
    private String name;
    private String description;
    private Long netPrice;
    private Integer vatRate;
    private String currency;
    private Integer stock;

    @Valid
    private List<ProductMediaRequest> media;
}
