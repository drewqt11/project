package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Portfolio summary response payload")
public class PortfolioSummaryResponse {
    
    @Schema(description = "Portfolio ID", example = "PORT-A0DR-2DA3")
    private String portfolioId;
    
    @Schema(description = "Portfolio title", example = "My Professional Portfolio")
    private String title;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
} 