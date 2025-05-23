package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant; // Or String if you prefer to handle formatting here

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Summary of a generated PDF document")
public class GeneratedPdfItemResponse {

    @Schema(description = "Unique ID of the generated PDF record", example = "PDF-A1B2-C3D4", required = true)
    private String id;

    @Schema(description = "ID of the original portfolio", example = "PORT-A0DR-2DA3", required = true)
    private String portfolioId;

    @Schema(description = "Custom display name given by the user for this PDF version", example = "Draft for Review")
    private String customDisplayName;

    @Schema(description = "Title of the original portfolio at the time of generation", example = "My Awesome Project", required = true)
    private String originalPortfolioTitle;

    @Schema(description = "Filename of the generated PDF", example = "portfolio_PORT-A0DR-2DA3.pdf", required = true)
    private String filename;

    @Schema(description = "URL to download the generated PDF", example = "/api/portfolios/PORT-A0DR-2DA3/download-pdf", required = true)
    private String downloadUrl; // This should match the actual download path structure

    @Schema(description = "Timestamp of when the PDF was generated", required = true)
    private Instant generatedAt; // Using Instant for precise time

    @Schema(description = "Size of the PDF file in bytes", example = "102400")
    private Long fileSize; // Optional

    @Schema(description = "Style options used for generating this PDF")
    private PdfStyleOptionsResponse styleOptions; // Added style options
} 