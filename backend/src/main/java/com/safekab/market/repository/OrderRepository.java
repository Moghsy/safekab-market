package com.safekab.market.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.safekab.market.entity.Order;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.TrackingStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Page<Order> findAllByUserId(Long userId, Pageable pageable);

    // Admin queries for filtering orders
    // @Query("SELECT o FROM Order o WHERE o.paymentStatus = :paymentStatus AND
    // o.trackingStatus = :trackingStatus")
    Page<Order> findAllByPaymentStatusAndTrackingStatus(
            PaymentStatus paymentStatus,
            TrackingStatus trackingStatus,
            Pageable pageable);
}
