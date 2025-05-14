package com.apas.website.security;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "JWT authentication response")
public class JwtResponse {
    
    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "JWT refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;
    
    @Schema(description = "Token type", example = "Bearer")
    private String type = "Bearer";
    
    @Schema(description = "User ID", example = "USER-A0DR-2DA3")
    private String userId;
    
    @Schema(description = "User first name", example = "John")
    private String firstName;
    
    @Schema(description = "User last name", example = "Doe")
    private String lastName;
    
    @Schema(description = "User email", example = "john.doe@example.com")
    private String email;
    
    public JwtResponse(String token, String refreshToken, String userId, String firstName, String lastName, String email) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
} 