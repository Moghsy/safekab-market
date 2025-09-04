package com.safekab.market.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Set<OrderProduct> orderProducts = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_location_id", nullable = true)
    private Location shipmentLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_status", nullable = false)
    private TrackingStatus trackingStatus;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = true)
    private String promotionCode;

    @Column(nullable = false)
    private Long shippingCost = 0L; // Shipping cost in pence/cents

    public void addOrderProduct(Product product, Integer quantity) {
        OrderProduct orderProduct = new OrderProduct();
        orderProduct.setOrder(this);
        orderProduct.setProduct(product);
        orderProduct.setQuantity(quantity);
        orderProducts.add(orderProduct);
    }

    public Long getTotalPrice() {
        Long productTotal = orderProducts.stream()
                .mapToLong(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
        return productTotal + shippingCost;
    }
}
