package com.safekab.market.service.payment;

import java.util.Map;

import com.safekab.market.entity.Order;

public interface PaymentProvider {

    String createPayment(Order order);

    boolean confirmPayment(String paymentIntentId);

    void handleWebHook(String payload, Map<String, String> headers);

}
