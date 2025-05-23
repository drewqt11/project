package com.apas.website.entities.models.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Details of the style options used for PDF generation")
public class PdfStyleOptionsResponse {

    @Schema(description = "Primary color used in the PDF", example = "#FF0000")
    private String primaryColor;

    @Schema(description = "Secondary color used in the PDF", example = "#00FF00")
    private String secondaryColor;

    @Schema(description = "Font family used in the PDF", example = "Arial")
    private String fontFamily;

    @Schema(description = "Flag indicating if the footer was included", example = "true")
    private boolean includeFooter;

    @Schema(description = "Page size of the PDF", example = "A4")
    private String pageSize;
} 