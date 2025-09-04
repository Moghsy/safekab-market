package com.safekab.market.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.safekab.market.dto.user.UserRequest;
import com.safekab.market.dto.user.UserResponse;
import com.safekab.market.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<UserResponse> getUser(Long userId) {
        return userRepository.findById(userId)
                .map(user -> new UserResponse(user.getUsername(),
                        user.getEmail(), user.getMobileNumber()));
    }

    public void updateUser(Long userId, UserRequest userRequest) {
        userRepository.findById(userId).ifPresent(user -> {
            if (userRequest.getUsername() != null && userRequest.getUsername().length() > 0) {
                user.setUsername(userRequest.getUsername());
            }
            if (userRequest.getPassword() != null && userRequest.getPassword().length() > 0) {
                user.setPassword(userRequest.getPassword());
            }
            if (userRequest.getMobileNumber() != null && userRequest.getMobileNumber().length() > 0) {
                user.setMobileNumber(userRequest.getMobileNumber());
            }
            userRepository.save(user);
        });
    }
}
