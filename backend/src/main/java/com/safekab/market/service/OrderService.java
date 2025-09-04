package com.safekab.market.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.safekab.market.dto.order.CreateOrderRequest;
import com.safekab.market.entity.Order;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.TrackingStatus;
import com.safekab.market.entity.User;
import com.safekab.market.exception.ApiException;
import com.safekab.market.repository.OrderRepository;
import com.safekab.market.repository.ProductRepository;
import com.safekab.market.repository.UserRepository;
import com.safekab.market.repository.ConfigRepository;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConfigRepository configRepository;

    /**
     * Get all orders for a user.
     */
    public Page<Order> findAllByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(10, size), Sort.by("id").descending());
        return orderRepository.findAllByUserId(userId, pageable);
    }

    /**
     * Admin method to get all orders with filtering.
     */
    public Page<Order> findAllOrdersForAdmin(PaymentStatus paymentStatus, TrackingStatus trackingStatus, int page,
            int size) {
        Pageable pageable = PageRequest.of(page, Math.min(50, size), Sort.by("orderDate").descending());
        return orderRepository.findAllByPaymentStatusAndTrackingStatus(paymentStatus, trackingStatus, pageable);
    }

    /**
     * Service for handling order-related operations.
     */
    public Optional<Order> findByIdWithoutVerification(Long id) {
        return orderRepository.findById(id);
    }

    /**
     * Find an order by its ID.
     */
    public Optional<Order> findById(Long id, Long userId) {
        return orderRepository.findByIdAndUserId(id, userId);
    }

    /**
     * Save an order to the database.
     */
    public Order save(Order order) {
        return orderRepository.save(order);
    }

    /**
     * Update order status (Admin only).
     */
    public Order updateOrderStatus(Long orderId, TrackingStatus trackingStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        order.setTrackingStatus(trackingStatus);
        return orderRepository.save(order);
    }

    /**
     * Create a new order for the given user and request.
     */
    public Order createOrder(Long userId, CreateOrderRequest createOrderRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Order order = new Order();
        createOrderRequest.getItems().forEach(item -> {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                order.addOrderProduct(product, item.getQuantity());
            });
        });
        order.setUser(user);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setTrackingStatus(TrackingStatus.NOT_SHIPPED);
        if (createOrderRequest.getPromotionCode() != null) {
            order.setPromotionCode(createOrderRequest.getPromotionCode());
        }
        
        // Set shipping cost from configuration
        configRepository.findAll().stream().findFirst().ifPresent(config -> {
            if (config.getShippingCost() != null) {
                order.setShippingCost(config.getShippingCost());
            }
        });
        
        return orderRepository.save(order);
    }
}
