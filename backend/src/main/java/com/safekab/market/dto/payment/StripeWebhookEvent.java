package com.safekab.market.dto.payment;

import lombok.Data;

@Data
public class StripeWebhookEvent {
    private String id;
    private String type;
    private Object data;
}
