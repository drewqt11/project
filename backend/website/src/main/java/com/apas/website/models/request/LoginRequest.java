package com.apas.website.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Login request payload")
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Schema(description = "User email address", example = "user@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Schema(description = "User password", example = "password123", required = true)
    private String password;
} 