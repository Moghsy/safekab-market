package com.safekab.market.dto.product;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.Product;
import com.safekab.market.entity.ProductImage;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@AllArgsConstructor
public class ProductResponseItem {

    private Long id;
    private String name;
    private String description;
    private Long netPrice;
    private Integer vatRate;
    private Integer stock;
    private List<ProductImageResponse> images;

    public ProductResponseItem(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.netPrice = product.getNetPrice();
        this.vatRate = product.getVatRate();
        this.stock = product.getStock();
        this.images = product.getImages().stream()
                .map(ProductImageResponse::new)
                .toList();
    }

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public class ProductImageResponse {

        private String imageUrl;
        private String altText;
        private Integer displayOrder;
        private String mediaType;

        public ProductImageResponse(ProductImage image) {
            this.imageUrl = image.getImageUrl();
            this.altText = image.getAltText();
            this.displayOrder = image.getDisplayOrder();
            this.mediaType = image.getMediaType();
        }
    }

}
