package com.safekab.market.dto.auth;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class LoginRequest {
  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  private String email;
  @NotBlank(message = "Password is required")
  private String password;
}
