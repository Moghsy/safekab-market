package com.safekab.market.controller.order;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.dto.order.AdminOrderResponse;
import com.safekab.market.dto.order.CreateOrderRequest;
import com.safekab.market.dto.order.OrderResponse;
import com.safekab.market.dto.order.UpdateOrderStatusRequest;
import com.safekab.market.entity.Order;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.TrackingStatus;
import com.safekab.market.exception.ApiException;
import com.safekab.market.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public Page<OrderResponse> getUserOrders(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var ordersPage = orderService.findAllByUserId(userId, page, size);
        return ordersPage.map(OrderResponse::new);
    }

    @GetMapping("/orders/{id}")
    public OrderResponse getOrder(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        Optional<Order> orderOpt = orderService.findById(id, userId);
        return orderOpt.map(OrderResponse::new)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("/orders")
    public OrderResponse postOrder(@AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateOrderRequest createOrderRequest) {
        var order = orderService.createOrder(userId, createOrderRequest);
        return new OrderResponse(order);
    }

    @GetMapping("/admin/orders")
    public Page<AdminOrderResponse> getAdminOrders(@RequestParam(name = "payment_status") PaymentStatus paymentStatus,
            @RequestParam(name = "tracking_status") TrackingStatus trackingStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var orders = orderService.findAllOrdersForAdmin(paymentStatus, trackingStatus, page, size);
        return orders.map(AdminOrderResponse::new);
    }

    @PatchMapping("/admin/orders/{id}")
    public AdminOrderResponse patchOrder(@PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest updateOrderRequest) {
        return new AdminOrderResponse(orderService.updateOrderStatus(id, updateOrderRequest.getTrackingStatus()));
    }

}
