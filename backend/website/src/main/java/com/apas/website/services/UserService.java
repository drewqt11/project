package com.apas.website.services;

import com.apas.website.entities.models.request.SignupRequest;
import com.apas.website.entities.models.response.SignupResponse;
import com.apas.website.entities.models.request.UpdateProfileRequest;
import com.apas.website.entities.UserEntity;

public interface UserService {
    SignupResponse registerUser(SignupRequest signupRequest);
    boolean existsByEmail(String email);
    UserEntity updateUserProfile(UserEntity user, UpdateProfileRequest profileRequest);
} 