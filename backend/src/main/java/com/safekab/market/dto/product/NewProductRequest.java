package com.safekab.market.dto.product;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NewProductRequest {
    @NotBlank(message = "Name is mandatory")
    private String name;
    @NotBlank(message = "Description is mandatory")
    private String description;
    @NotNull(message = "Net Price is mandatory")
    private Long netPrice;

    private Integer stock;
    @NotNull(message = "Currency is mandatory")
    private String currency;
    @NotNull(message = "VAT rate is mandatory")
    private Integer vatRate;

    @Valid
    private List<ProductMediaRequest> media;
}
