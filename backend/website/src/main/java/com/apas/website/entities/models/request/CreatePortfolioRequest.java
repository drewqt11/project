package com.apas.website.entities.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Create portfolio request payload")
public class CreatePortfolioRequest {
    
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    @Schema(description = "Portfolio title", example = "My Professional Portfolio")
    private String title;
} 