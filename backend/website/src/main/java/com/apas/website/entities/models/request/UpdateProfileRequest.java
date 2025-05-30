package com.apas.website.entities.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Update profile request payload")
public class UpdateProfileRequest {
    
    @Size(min = 2, message = "First name must be at least 2 characters long")
    @Pattern(regexp = "^[A-Z][a-zA-Z]*$", message = "First name should start with a capital letter and contain only alphabets")
    @Schema(description = "User's first name", example = "John")
    private String firstName;
    
    @Size(min = 2, message = "Last name must be at least 2 characters long")
    @Pattern(regexp = "^[A-Z][a-zA-Z]*$", message = "Last name should start with a capital letter and contain only alphabets")
    @Schema(description = "User's last name", example = "Doe")
    private String lastName;
} 