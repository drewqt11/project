package com.apas.website.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Sign up request payload")
public class SignupRequest {
    
    @NotBlank(message = "First name is required")
    @Schema(description = "User's first name", example = "John", required = true)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Schema(description = "User's last name", example = "Doe", required = true)
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Schema(description = "User's email address", example = "john.doe@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Schema(description = "User's password (min 8 characters)", example = "password123", required = true)
    private String password;
    
    // Explicit getters to ensure they're available at compile time
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
} 