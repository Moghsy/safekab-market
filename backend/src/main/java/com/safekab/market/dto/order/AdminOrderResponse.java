package com.safekab.market.dto.order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.safekab.market.entity.Location;
import com.safekab.market.entity.Order;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.TrackingStatus;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AdminOrderResponse {
    private Long id;
    private PaymentStatus paymentStatus;
    private TrackingStatus trackingStatus;
    private LocalDateTime orderDate;
    private Long totalPrice;
    private Long shippingCost;
    private List<OrderProductResponse> items;
    private UserInfo user;
    private LocationInfo shipmentLocation;
    private String promotionCode;

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;

        public UserInfo(com.safekab.market.entity.User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
        }
    }

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class LocationInfo {
        private Long id;
        private String line1;
        private String line2;
        private String city;
        private String postalCode;
        private String country;

        public LocationInfo(Location location) {
            this.id = location.getId();
            this.line1 = location.getLine1();
            this.line2 = location.getLine2();
            this.city = location.getCity();
            this.postalCode = location.getPostalCode();
            this.country = location.getCountry();
        }
    }

    public AdminOrderResponse(Order order) {
        this.id = order.getId();
        this.paymentStatus = order.getPaymentStatus();
        this.trackingStatus = order.getTrackingStatus();
        this.orderDate = order.getOrderDate();
        this.totalPrice = order.getTotalPrice();
        this.shippingCost = order.getShippingCost();
        this.items = order.getOrderProducts().stream()
                .map(OrderProductResponse::new)
                .collect(Collectors.toList());
        this.user = new UserInfo(order.getUser());
        this.shipmentLocation = order.getShipmentLocation() != null
                ? new LocationInfo(order.getShipmentLocation())
                : null;
        this.promotionCode = order.getPromotionCode();
    }
}
