
package com.safekab.market.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.safekab.market.dto.user.UserRequest;
import com.safekab.market.dto.user.UserResponse;
import com.safekab.market.exception.ApiException;
import com.safekab.market.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping()
  public ResponseEntity<UserResponse> getUser(Authentication authentication) {
    Long userId = (Long) authentication.getPrincipal();
    UserResponse user = userService.getUser(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    return ResponseEntity.ok(user);
  }

  @PostMapping()
  public void updateUser(@Valid @RequestBody UserRequest userRequest, Authentication authentication) {
    Long userId = (Long) authentication.getPrincipal();
    if (userRequest != null) {
      userService.updateUser(userId, userRequest);
    }
  }

}
