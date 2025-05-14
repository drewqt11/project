package com.apas.website.controllers;

import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.LoginRequest;
import com.apas.website.entities.models.request.SignupRequest;
import com.apas.website.entities.models.response.SignupResponse;
import com.apas.website.repositories.UserRepository;
import com.apas.website.security.JwtResponse;
import com.apas.website.security.JwtUtils;
import com.apas.website.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Authentication", description = "Authentication management APIs including traditional login and Google OAuth2 authentication")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Autowired
    public AuthController(UserService userService, AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Operation(summary = "User login", description = "Authenticates a user and returns JWT tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful authentication", 
                     content = @Content(schema = @Schema(implementation = JwtResponse.class))),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userDetails.getUsername()));
        
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                refreshToken,
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        ));
    }

    @Operation(summary = "Register new user", description = "Creates a new user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User successfully registered", 
                     content = @Content(schema = @Schema(implementation = SignupResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input or email already in use")
    })
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        SignupResponse response = userService.registerUser(signupRequest);
        
        if (response.getMessage().contains("already in use")) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get Google OAuth2 login URL", description = "Returns the URL for Google OAuth2 login")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Google OAuth2 URL returned successfully")
    })
    @GetMapping("/google-login-url")
    public ResponseEntity<String> getGoogleLoginUrl() {
        String redirectUri = "http://localhost:8080/login/oauth2/code/google";
        String scope = "email profile";
        
        String googleLoginUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + googleClientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=" + scope +
                "&access_type=offline";
        
        return ResponseEntity.ok(googleLoginUrl);
    }
} 