package com.apas.website.controllers;

import com.apas.website.models.request.SignupRequest;
import com.apas.website.models.response.SignupResponse;
import com.apas.website.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        SignupResponse response = userService.registerUser(signupRequest);
        
        if (response.getMessage().contains("already in use")) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
} 