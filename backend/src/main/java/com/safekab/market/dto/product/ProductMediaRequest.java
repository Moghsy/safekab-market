package com.safekab.market.dto.product;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProductMediaRequest {
    @NotBlank(message = "Image URL is mandatory")
    private String imageUrl;

    private String altText;

    @NotNull(message = "Display order is mandatory")
    private Integer displayOrder;

    @NotBlank(message = "Media type is mandatory")
    private String mediaType; // "image" or "video"
}
