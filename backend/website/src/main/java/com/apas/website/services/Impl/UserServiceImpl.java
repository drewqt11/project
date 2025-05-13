package com.apas.website.services.Impl;

import com.apas.website.models.request.SignupRequest;
import com.apas.website.models.response.SignupResponse;
import com.apas.website.models.User;
import com.apas.website.repositories.UserRepository;
import com.apas.website.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SignupResponse registerUser(SignupRequest signupRequest) {
        // Check if the user already exists
        if (existsByEmail(signupRequest.getEmail())) {
            return new SignupResponse(null, null, null, null, 
                "Email already in use!");
        }

        // Create new user
        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        // Save user
        User savedUser = userRepository.save(user);

        // Return response
        return new SignupResponse(
            savedUser.getId(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getEmail(),
            "User registered successfully!"
        );
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
} 