package com.safekab.market.service.payment;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.safekab.market.entity.Location;
import com.safekab.market.entity.Order;
import com.safekab.market.entity.OrderProduct;
import com.safekab.market.entity.PaymentStatus;
import com.safekab.market.entity.Product;
import com.safekab.market.entity.User;
import com.safekab.market.exception.ApiException;
import com.safekab.market.repository.LocationRepository;
import com.safekab.market.service.OrderService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Address;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;

public class StripePaymentProvider implements PaymentProvider {

  private final String currency;
  private final String returnUrlBase;
  private final String endpointSecret;
  private final OrderService orderService;
  private final LocationRepository locationRepository;

  public StripePaymentProvider(
      String apiKey,
      String currency,
      String returnUrlBase,
      String endpointSecret,
      OrderService orderService,
      LocationRepository locationRepository) {
    Stripe.apiKey = apiKey;
    this.currency = currency;
    this.returnUrlBase = returnUrlBase;
    this.endpointSecret = endpointSecret;
    this.orderService = orderService;
    this.locationRepository = locationRepository;
  }

  // public int getPrice() {

  // }

  @Override
  public String createPayment(Order order) {
    if (order.getPaymentStatus() == PaymentStatus.PAID) {
      throw new IllegalArgumentException("Order is already paid");
    }
    try {
      order.getOrderProducts().forEach(item -> item.getProduct());
      List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
      for (OrderProduct orderProduct : order.getOrderProducts()) {
        Product product = orderProduct.getProduct();
        Integer quantity = orderProduct.getQuantity();
        SessionCreateParams.LineItem.PriceData.ProductData productData = SessionCreateParams.LineItem.PriceData.ProductData
            .builder()
            .setName(product.getName())
            // .addImage(product.getImageUrl())
            .build();
        SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData
            .builder()
            .setCurrency(currency)
            .setUnitAmount(product.getPrice())
            .setProductData(productData)
            .build();
        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem
            .builder()
            .setPriceData(priceData)
            .setQuantity((long) quantity)
            .build();
        lineItems.add(lineItem);
      }

      // Add shipping as a line item if it exists
      if (order.getShippingCost() != null && order.getShippingCost() > 0) {
        SessionCreateParams.LineItem.PriceData.ProductData shippingProductData = SessionCreateParams.LineItem.PriceData.ProductData
            .builder()
            .setName("Shipping")
            .build();
        SessionCreateParams.LineItem.PriceData shippingPriceData = SessionCreateParams.LineItem.PriceData
            .builder()
            .setCurrency(currency)
            .setUnitAmount(order.getShippingCost())
            .setProductData(shippingProductData)
            .build();
        SessionCreateParams.LineItem shippingLineItem = SessionCreateParams.LineItem
            .builder()
            .setPriceData(shippingPriceData)
            .setQuantity(1L)
            .build();
        lineItems.add(shippingLineItem);
      }

      SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setSuccessUrl("%s/checkout/success/%s".formatted(returnUrlBase, order.getId()))
          .setCancelUrl("%s/checkout/cancel/%s".formatted(returnUrlBase, order.getId()))
          .addAllLineItem(lineItems)
          .putMetadata("order_id", order.getId().toString())
          .setShippingAddressCollection(
              SessionCreateParams.ShippingAddressCollection.builder()
                  .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.GB)
                  .build());
      // .setAllowPromotionCodes(true);
      // .setAutomaticTax(SessionCreateParams.AutomaticTax.builder().setEnabled(true).build());
      // if (order.getPromotionCode() != null) {
      // paramsBuilder.addDiscount(SessionCreateParams.Discount.builder()
      // .setCoupon(order.getPromotionCode())
      // .build());
      // }
      Session session = Session.create(paramsBuilder.build());
      return session.getUrl();
    } catch (StripeException e) {
      throw new RuntimeException("Stripe checkout session creation failed", e);
    }
  }

  @Override
  public boolean confirmPayment(String paymentIntentId) {
    try {
      PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
      return "succeeded".equals(intent.getStatus());
    } catch (StripeException e) {
      throw new RuntimeException("Stripe payment confirmation failed", e);
    }
  }

  private void handleWebHookHelper(Session session) {
    if (session != null && session.getMetadata() != null) {
      String orderIdStr = session.getMetadata().get("order_id");
      if (orderIdStr != null) {
        try {
          Long orderId = Long.valueOf(orderIdStr);
          Session.CustomerDetails customerDetails = session.getCustomerDetails();
          Address address = null;
          if (customerDetails != null && customerDetails.getAddress() != null) {
            address = customerDetails.getAddress();
          }
          Address finalAddress = address;
          orderService.findByIdWithoutVerification(orderId).ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.PAID);
            if (finalAddress != null) {
              User user = order.getUser();
              Location location = locationRepository.findByAddressAndUser(
                  finalAddress.getLine1(),
                  finalAddress.getLine2(),
                  finalAddress.getCity(),
                  finalAddress.getPostalCode(),
                  finalAddress.getCountry(),
                  user).orElseGet(() -> {
                    Location newLoc = new Location();
                    newLoc.setLine1(finalAddress.getLine1());
                    newLoc.setLine2(finalAddress.getLine2());
                    newLoc.setCity(finalAddress.getCity());
                    newLoc.setPostalCode(finalAddress.getPostalCode());
                    newLoc.setCountry(finalAddress.getCountry());
                    newLoc.setUser(user);
                    return locationRepository.save(newLoc);
                  });
              order.setShipmentLocation(location);
            }
            order.setPromotionCode(session.getDiscounts() != null &&
                !session.getDiscounts().isEmpty()
                    ? session.getDiscounts().getFirst().getPromotionCode()
                    : null);
            orderService.save(order);
          });
        } catch (NumberFormatException ex) {
          System.err.println("Invalid order_id in Stripe session metadata: " + orderIdStr);
        }
      }
    }
  }

  @Override
  public void handleWebHook(String payload, Map<String, String> headers) {
    try {
      String header = headers.get("stripe-signature");
      if (header == null) {
        throw new ApiException("Missing Stripe-Signature header", HttpStatus.BAD_REQUEST);
      }
      Event event = Webhook.constructEvent(payload, header, endpointSecret);
      if ("checkout.session.completed".equals(event.getType())) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        handleWebHookHelper(session);
      }
    } catch (SignatureVerificationException | NullPointerException e) {
      throw new ApiException("Stripe webhook signature verification failed", HttpStatus.BAD_REQUEST);
    }
  }
}
