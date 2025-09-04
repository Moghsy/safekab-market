package com.safekab.market.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.safekab.market.repository.LocationRepository;
import com.safekab.market.service.OrderService;
import com.safekab.market.service.payment.PaymentProvider;
import com.safekab.market.service.payment.StripePaymentProvider;

@Configuration
public class PaymentConfig {

  @Bean
  public PaymentProvider paymentProvider(
      @Value("${app.payment.api.key}") String apiKey,
      @Value("${app.payment.currency}") String currency,
      @Value("${app.payment.provider}") String provider,
      @Value("${app.server.frontend.url}") String url,
      @Value("${app.payment.webhook.secret}") String endpointSecret,
      OrderService orderService,
      LocationRepository locationRepository) {
    if (provider.equals("stripe")) {
      return new StripePaymentProvider(
          apiKey,
          currency,
          url,
          endpointSecret,
          orderService,
          locationRepository);
    }
    throw new IllegalArgumentException("Invalid payment provider");
  }
}
