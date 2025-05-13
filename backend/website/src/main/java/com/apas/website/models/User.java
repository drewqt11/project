package com.apas.website.models;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Schema(description = "User entity")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique user ID", example = "1")
    private Long id;
    
    @NotBlank(message = "First name is required")
    @Column(name = "first_name")
    @Schema(description = "User's first name", example = "John")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Column(name = "last_name")
    @Schema(description = "User's last name", example = "Doe")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Schema(description = "User's password (hashed)", example = "$2a$10$...", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;
    
    // Explicit getters to ensure they're available at compile time
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
    
    public String getPassword() {
        return password;
    }
} 