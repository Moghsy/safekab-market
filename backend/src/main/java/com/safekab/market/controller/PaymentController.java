package com.safekab.market.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.dto.payment.CreatePaymentRequest;
import com.safekab.market.dto.payment.CreatePaymentResponse;
import com.safekab.market.service.payment.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public CreatePaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        String url = paymentService.createPayment(
                request.getOrderId());
        return new CreatePaymentResponse(url);
    }

    @PostMapping("/webhook")
    public void postWebhookHandler(@RequestBody String payload, @RequestHeader Map<String, String> headers) {
        paymentService.handleWebhook(payload, headers);
    }

}
