package com.apas.website.services;

import com.apas.website.models.request.SignupRequest;
import com.apas.website.models.response.SignupResponse;

public interface UserService {
    SignupResponse registerUser(SignupRequest signupRequest);
    boolean existsByEmail(String email);
} 