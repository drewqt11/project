package com.apas.website.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DynamicUpdate
@Table(name = "portfolios")
@Schema(description = "Portfolio entity")
public class PortfolioEntity {
    
    @SuppressWarnings("deprecation")
    @Id
    @GenericGenerator(name = "portfolio_id_generator", strategy = "com.apas.website.utilities.PortfolioIdGenerator")
    @GeneratedValue(generator = "portfolio_id_generator")
    @Column(name = "portfolio_id", updatable = false, nullable = false, columnDefinition = "VARCHAR(25)")
    @Schema(description = "Unique portfolio ID", example = "PORT-A0DR-2DA3")
    private String portfolioId;
    
    @NotBlank(message = "Title is required")
    @Column(name = "title")
    @Schema(description = "Portfolio title", example = "My Professional Portfolio")
    private String title;
    
    @Column(name = "personal_information", columnDefinition = "TEXT")
    @Schema(description = "Personal information in JSON format")
    private String personalInformation;
    
    @Column(name = "employment_history", columnDefinition = "TEXT")
    @Schema(description = "Employment history in JSON format")
    private String employmentHistory;
    
    @Column(name = "educational_background", columnDefinition = "TEXT")
    @Schema(description = "Educational background in JSON format")
    private String educationalBackground;
    
    @Column(name = "skills", columnDefinition = "TEXT")
    @Schema(description = "Skills in JSON format")
    private String skills;
    
    @Column(name = "project_showcases", columnDefinition = "TEXT")
    @Schema(description = "Project showcases in JSON format")
    private String projectShowcases;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    @Schema(description = "User who owns this portfolio")
    private UserEntity user;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
} 