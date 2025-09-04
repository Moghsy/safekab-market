package com.safekab.market.dto.order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.Order;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.TrackingStatus;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OrderResponse {
    private Long id;
    private PaymentStatus paymentStatus;
    private TrackingStatus trackingStatus;
    private LocalDateTime orderDate;
    private Long totalPrice;
    private Long shippingCost;
    private List<OrderProductResponse> items;

    public OrderResponse(Order order) {
        this.id = order.getId();
        this.paymentStatus = order.getPaymentStatus();
        this.trackingStatus = order.getTrackingStatus();
        this.orderDate = order.getOrderDate();
        this.totalPrice = order.getTotalPrice();
        this.shippingCost = order.getShippingCost();
        this.items = order.getOrderProducts().stream()
                .map(OrderProductResponse::new)
                .collect(Collectors.toList());
    }

    public OrderResponse(Long id) {
        this.id = id;
    }
}
