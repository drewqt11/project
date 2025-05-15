package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "PDF generation response with download URL")
public class PdfGenerationResponse {
    
    @Schema(description = "Status of the PDF generation", example = "success", required = true)
    private String status;
    
    @Schema(description = "URL to download the generated PDF", example = "/api/portfolios/PORT-A0DR-2DA3/download-pdf", required = true)
    private String pdfUrl;
    
    @Schema(description = "Filename of the generated PDF", example = "portfolio_PORT-A0DR-2DA3.pdf")
    private String filename;
} 