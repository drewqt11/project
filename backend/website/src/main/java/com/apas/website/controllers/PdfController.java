package com.apas.website.controllers;

import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.PdfGenerationResponse;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.services.PdfService;
import com.apas.website.services.PdfStorageService;
import com.apas.website.services.PortfolioService;
import com.apas.website.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/portfolios")
@Tag(name = "PDF Generation", description = "APIs for generating and downloading portfolio PDFs")
@SecurityRequirement(name = "bearerAuth")
public class PdfController {

    private static final Logger logger = LoggerFactory.getLogger(PdfController.class);
    
    private final PdfService pdfService;
    private final PdfStorageService pdfStorageService;
    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    @Autowired
    public PdfController(PdfService pdfService, PdfStorageService pdfStorageService, 
                         PortfolioService portfolioService, UserRepository userRepository) {
        this.pdfService = pdfService;
        this.pdfStorageService = pdfStorageService;
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Generate portfolio PDF", 
               description = "Generates a PDF for a portfolio with optional customization options")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF generated successfully", 
                     content = @Content(schema = @Schema(implementation = PdfGenerationResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only generate PDFs for your own portfolios")
    })
    @PostMapping("/{portfolioId}/generate-pdf")
    public ResponseEntity<PdfGenerationResponse> generatePdf(
            @PathVariable String portfolioId,
            @Valid @RequestBody(required = false) PdfGenerationRequest request) {
        
        try {
            // First get the portfolio to check ownership
            PortfolioResponse portfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Check if the authenticated user is trying to generate PDF for their own portfolio
            if (!isUserAuthorized(portfolio.getUserId())) {
                throw new AccessDeniedException("You can only generate PDFs for your own portfolios");
            }
            
            // Use default options if none provided
            if (request == null) {
                request = new PdfGenerationRequest();
            }
            
            // Generate the PDF
            ByteArrayOutputStream pdfContent = pdfService.generatePortfolioPdf(portfolioId, request);
            
            // Store the PDF
            String filename = pdfStorageService.storePdf(portfolioId, pdfContent);
            
            // Create response with download URL
            PdfGenerationResponse response = new PdfGenerationResponse(
                "success", 
                "/api/portfolios/" + portfolioId + "/download-pdf",
                filename
            );
            
            logger.info("Generated PDF for portfolio {}", portfolioId);
            return ResponseEntity.ok(response);
            
        } catch (EntityNotFoundException e) {
            logger.error("Failed to generate PDF: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    @Operation(summary = "Download portfolio PDF", 
               description = "Downloads a previously generated PDF for a portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF file", 
                     content = @Content(mediaType = "application/pdf")),
        @ApiResponse(responseCode = "404", description = "PDF not found or not generated yet"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only download PDFs for your own portfolios")
    })
    @GetMapping("/{portfolioId}/download-pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String portfolioId) {
        try {
            // First get the portfolio to check ownership
            PortfolioResponse portfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Check if the authenticated user is trying to download PDF for their own portfolio
            if (!isUserAuthorized(portfolio.getUserId())) {
                throw new AccessDeniedException("You can only download PDFs for your own portfolios");
            }
            
            // Retrieve the PDF
            byte[] pdfContent = pdfStorageService.retrievePdf(portfolioId);
            
            if (pdfContent == null) {
                logger.warn("PDF for portfolio {} not found", portfolioId);
                return ResponseEntity.notFound().build();
            }
            
            // Set headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", pdfStorageService.getFilename(portfolioId));
            
            logger.info("Downloading PDF for portfolio {}", portfolioId);
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
            
        } catch (EntityNotFoundException e) {
            logger.error("Failed to download PDF: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error downloading PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to download PDF: " + e.getMessage(), e);
        }
    }
    
    /**
     * Checks if the currently authenticated user is authorized to access resources for the given user ID
     * 
     * @param userId The user ID to check
     * @return true if authorized, false otherwise
     */
    private boolean isUserAuthorized(String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Get the user ID from the email
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(user -> user.getUserId().equals(userId))
                    .orElse(false);
        }
        return false;
    }
}