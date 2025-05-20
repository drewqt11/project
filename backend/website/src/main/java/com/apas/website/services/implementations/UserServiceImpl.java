package com.apas.website.services.implementations;

import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.SignupRequest;
import com.apas.website.entities.models.response.SignupResponse;
import com.apas.website.repositories.UserRepository;
import com.apas.website.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.apas.website.entities.models.request.UpdateProfileRequest;
import org.apache.commons.lang3.StringUtils;

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
        
        // Validate password length for normal users
        if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 8) {
            return new SignupResponse(null, null, null, null, 
                "Password must be at least 8 characters long");
        }

        // Create new user
        UserEntity user = new UserEntity();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setIsOAuth2User(false); // This is a normal user registration

        // Save user
        UserEntity savedUser = userRepository.save(user);

        // Return response
        return new SignupResponse(
            savedUser.getUserId(),
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

    @Override
    public UserEntity updateUserProfile(UserEntity user, UpdateProfileRequest profileRequest) {
        // Update first name if provided
        if (StringUtils.isNotBlank(profileRequest.getFirstName())) {
            user.setFirstName(profileRequest.getFirstName());
        }

        // Update last name if provided
        if (StringUtils.isNotBlank(profileRequest.getLastName())) {
            user.setLastName(profileRequest.getLastName());
        }

        return userRepository.save(user);
    }
} 