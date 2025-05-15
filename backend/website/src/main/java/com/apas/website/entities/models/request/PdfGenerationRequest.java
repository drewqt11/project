package com.apas.website.entities.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "PDF generation request with customization options")
public class PdfGenerationRequest {
    
    @Schema(description = "Primary color for headings and titles (hex code)", example = "#2d5f9a")
    private String primaryColor;
    
    @Schema(description = "Secondary color for subheadings and highlights (hex code)", example = "#4a7fb5")
    private String secondaryColor;
    
    @Schema(description = "Font family for the document", example = "Arial")
    private String fontFamily;
    
    @Schema(description = "Include footer with generation date", example = "true", defaultValue = "true")
    private Boolean includeFooter = true;
    
    @Schema(description = "Page size (A4, LETTER, etc.)", example = "A4", defaultValue = "A4")
    private String pageSize = "A4";
} 