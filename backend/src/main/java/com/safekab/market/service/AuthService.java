package com.safekab.market.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.safekab.market.dto.auth.AuthResponse;
import com.safekab.market.dto.auth.LoginRequest;
import com.safekab.market.dto.auth.RefreshTokenRequest;
import com.safekab.market.dto.auth.RegisterRequest;
import com.safekab.market.entity.RefreshToken;
import com.safekab.market.entity.Role;
import com.safekab.market.entity.RoleName;
import com.safekab.market.entity.User;
import com.safekab.market.exception.ApiException;
import com.safekab.market.repository.RefreshTokenRepository;
import com.safekab.market.repository.RoleRepository;
import com.safekab.market.repository.UserRepository;
import com.safekab.market.token.Token;
import com.safekab.market.token.TokenBuilder;
import com.safekab.market.token.TokenType;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Value("${app.token.refreshExpiration:604800000}")
    private long refreshTokenExpiry;

    @Autowired
    private TokenBuilder tokenBuilder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private RoleRepository roleRepository;

    public void saveRefreshToken(Token refreshToken, User user) {
        RefreshToken newRefreshTokenEntity = new RefreshToken();
        newRefreshTokenEntity.setUser(user);
        newRefreshTokenEntity.setToken(refreshToken.getToken());
        newRefreshTokenEntity.setExpiryDate(java.time.LocalDateTime.now().plus(refreshTokenExpiry,
                java.time.temporal.ChronoUnit.MILLIS));
        refreshTokenRepository.save(newRefreshTokenEntity);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            throw new ApiException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }
        List<String> roles = userOpt.get().getRoleNamesAsString();
        Token accessToken = tokenBuilder.createToken(String.valueOf(userOpt.get().getId()), TokenType.ACCESS, roles);
        Token refreshToken = tokenBuilder.createToken(String.valueOf(userOpt.get().getId()), TokenType.REFRESH, roles);
        saveRefreshToken(refreshToken, userOpt.get());
        return new AuthResponse(true, "Login successful", accessToken.getToken(), refreshToken.getToken());

    }

    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();
        String email = request.getEmail();
        if (userRepository.existsByUsername(username)) {
            throw new ApiException("Username already exists", HttpStatus.CONFLICT);
        }
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User();
        user.setUsername(username);
        user.setPassword(hashedPassword);
        user.setEmail(email);
        // set optional mobile number from registration request
        user.setMobileNumber(request.getMobileNumber());
        // assign default role USER (persisted Role entity)
        Role role = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ApiException("Default role not found", HttpStatus.INTERNAL_SERVER_ERROR));
        user.getRoles().add(role);
        userRepository.save(user);
        List<String> roles = user.getRoleNamesAsString();
        Token accessToken = tokenBuilder.createToken(String.valueOf(user.getId()), TokenType.ACCESS, roles);
        Token refreshToken = tokenBuilder.createToken(String.valueOf(user.getId()), TokenType.REFRESH, roles);
        saveRefreshToken(refreshToken, user);
        return new AuthResponse(true, "Registration successful", accessToken.getToken(), refreshToken.getToken());
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        Token token;
        try {
            token = tokenBuilder.parseToken(refreshToken); // Validate token format
        } catch (Exception e) {
            throw new ApiException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }
        if (!token.isValid(TokenType.REFRESH)) {
            throw new ApiException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }
        // Validate refresh token in DB
        RefreshToken tokenEntity = refreshTokenRepository.findByTokenForUpdate(refreshToken)
                .orElseThrow(() -> new ApiException("Refresh token not found", HttpStatus.NOT_FOUND));
        if (tokenEntity.isBlocked()) {
            throw new ApiException("Refresh token is blocked", HttpStatus.UNAUTHORIZED);
        }
        if (tokenEntity.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new ApiException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }
        List<String> rolesForUser = tokenEntity.getUser().getRoleNamesAsString();
        Token newAccessToken = tokenBuilder.createToken(String.valueOf(tokenEntity.getUser().getId()), TokenType.ACCESS,
                rolesForUser);
        Token newRefreshToken = tokenBuilder.createToken(String.valueOf(tokenEntity.getUser().getId()),
                TokenType.REFRESH,
                rolesForUser);
        // Save new refresh token in DB
        saveRefreshToken(newRefreshToken, tokenEntity.getUser());
        tokenEntity.setExpiryDate(LocalDateTime.now().plusMinutes(2));
        // refreshTokenRepository.delete(tokenEntity);

        return new AuthResponse(true, "Token refreshed", newAccessToken.getToken(), newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new ApiException("Invalid refresh token", HttpStatus.BAD_REQUEST);
        }
        RefreshToken tokenEntity = refreshTokenRepository.findByTokenForUpdate(refreshToken)
                .orElseThrow(() -> new ApiException("Refresh token not found", HttpStatus.NOT_FOUND));
        refreshTokenRepository.delete(tokenEntity);
    }

}
