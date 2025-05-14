package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Schema(description = "Sign up response payload")
public class SignupResponse {
    
    @Schema(description = "User ID", example = "USER-A0DR-2DA3")
    private String userId;
    
    @Schema(description = "User first name", example = "John")
    private String firstName;
    
    @Schema(description = "User last name", example = "Doe")
    private String lastName;
    
    @Schema(description = "User email", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "Response message", example = "User registered successfully")
    private String message;
    
    // Explicit constructor with all parameters
    public SignupResponse(String userId, String firstName, String lastName, String email, String message) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.message = message;
    }
    
    // Explicit getter for message
    public String getMessage() {
        return this.message;
    }
    
    // Additional getters
    public String getUserId() {
        return userId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public String getEmail() {
        return email;
    }
} 