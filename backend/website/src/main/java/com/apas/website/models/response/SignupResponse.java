package com.apas.website.models.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SignupResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
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