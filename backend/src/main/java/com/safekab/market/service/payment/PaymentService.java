package com.safekab.market.service.payment;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.safekab.market.entity.Order;
import com.safekab.market.repository.OrderRepository;

@Service
public class PaymentService {

    private final PaymentProvider paymentProvider;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentProvider paymentProvider, OrderRepository orderRepository) {
        this.paymentProvider = paymentProvider;
        this.orderRepository = orderRepository;
    }

    public String createPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID"));
        return paymentProvider.createPayment(order);
    }

    public boolean confirmPayment(String paymentIntentId) {
        return paymentProvider.confirmPayment(paymentIntentId);
    }

    public void handleWebhook(String payload, Map<String, String> headers) {
        paymentProvider.handleWebHook(payload, headers);
    }
}
