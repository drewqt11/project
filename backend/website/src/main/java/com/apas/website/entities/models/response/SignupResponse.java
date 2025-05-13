package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Schema(description = "Sign up response payload")
public class SignupResponse {
    
    @Schema(description = "User ID", example = "1")
    private Long id;
    
    @Schema(description = "User first name", example = "John")
    private String firstName;
    
    @Schema(description = "User last name", example = "Doe")
    private String lastName;
    
    @Schema(description = "User email", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "Response message", example = "User registered successfully")
    private String message;
    
    // Explicit constructor with all parameters
    public SignupResponse(Long id, String firstName, String lastName, String email, String message) {
        this.id = id;
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
    public Long getId() {
        return id;
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