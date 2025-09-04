package com.safekab.market.dto.order;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.TrackingStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateOrderStatusRequest {
    @NotNull(message = "Tracking status is required")
    private TrackingStatus trackingStatus;
}
