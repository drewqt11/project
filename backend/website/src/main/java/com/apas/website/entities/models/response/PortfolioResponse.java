package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Portfolio response payload")
public class PortfolioResponse {
    
    @Schema(description = "Portfolio ID", example = "PORT-A0DR-2DA3")
    private String portfolioId;
    
    @Schema(description = "Portfolio title", example = "My Professional Portfolio")
    private String title;
    
    @Schema(description = "User ID of the portfolio owner", example = "USER-A0DR-2DA3")
    private String userId;
    
    @Schema(
        description = "Personal information in JSON format",
        example = "{\"fullName\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"123-456-7890\", \"address\": \"123 Main St, City, Country\", \"summary\": \"Experienced software developer with 5+ years in web development.\"}"
    )
    private Object personalInformation;
    
    @Schema(
        description = "Employment history in JSON format",
        example = "[{\"company\": \"Tech Company Inc.\", \"position\": \"Senior Developer\", \"startDate\": \"2020-01\", \"endDate\": \"Present\", \"description\": \"Led development of enterprise web applications.\"}]"
    )
    private Object employmentHistory;
    
    @Schema(
        description = "Educational background in JSON format",
        example = "[{\"institution\": \"University of Technology\", \"degree\": \"Bachelor of Computer Science\", \"year\": \"2019\", \"gpa\": \"3.8/4.0\"}]"
    )
    private Object educationalBackground;
    
    @Schema(
        description = "Skills in JSON format",
        example = "[{\"category\": \"Programming Languages\", \"items\": [\"Java\", \"JavaScript\", \"Python\"]}, {\"category\": \"Frameworks\", \"items\": [\"Spring Boot\", \"React\", \"Angular\"]}]"
    )
    private Object skills;
    
    @Schema(
        description = "Project showcases in JSON format",
        example = "[{\"title\": \"E-commerce Platform\", \"description\": \"Developed a full-stack e-commerce solution\", \"technologies\": [\"Spring Boot\", \"React\", \"PostgreSQL\"], \"link\": \"https://github.com/example/project\"}]"
    )
    private Object projectShowcases;
    
    @Schema(description = "Creation timestamp", example = "2023-04-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp", example = "2023-04-16T14:45:00")
    private LocalDateTime updatedAt;
} 