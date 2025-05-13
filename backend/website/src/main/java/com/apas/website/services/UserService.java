package com.apas.website.services;

import com.apas.website.entities.models.request.SignupRequest;
import com.apas.website.entities.models.response.SignupResponse;

public interface UserService {
    SignupResponse registerUser(SignupRequest signupRequest);
    boolean existsByEmail(String email);
} 