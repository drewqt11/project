package com.apas.website.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DynamicUpdate
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Schema(description = "User entity")
public class UserEntity {
    
    @SuppressWarnings("deprecation")
    @Id
    @GenericGenerator(name = "user_id_generator", strategy = "com.apas.website.utilities.UserIdGenerator")
    @GeneratedValue(generator = "user_id_generator")
    @Column(name = "user_id", updatable = false, nullable = false, columnDefinition = "VARCHAR(20)")
    @Schema(description = "Unique user ID", example = "USER-A0DR-2DA3")
    private String userId;
    
    @NotBlank(message = "First name is required")
    @Column(name = "first_name")
    @Schema(description = "User's first name", example = "John")
    private String firstName;
    
    @Column(name = "last_name")
    @Schema(description = "User's last name (optional for OAuth2 users)", example = "Doe")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "User's password (hashed)", example = "$2a$10$...", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;
    
    @Schema(description = "Indicates if the user was registered via OAuth2", example = "false")
    private Boolean isOAuth2User = false;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Schema(description = "User's portfolios")
    private List<PortfolioEntity> portfolios = new ArrayList<>();
    
    // Explicit getters to ensure they're available at compile time
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
    
    public String getPassword() {
        return password;
    }
    
    public Boolean getIsOAuth2User() {
        return isOAuth2User;
    }
    
    public List<PortfolioEntity> getPortfolios() {
        return portfolios;
    }
    
    // Helper method to add a portfolio
    public void addPortfolio(PortfolioEntity portfolio) {
        portfolios.add(portfolio);
        portfolio.setUser(this);
    }
    
    // Helper method to remove a portfolio
    public void removePortfolio(PortfolioEntity portfolio) {
        portfolios.remove(portfolio);
        portfolio.setUser(null);
    }
} 