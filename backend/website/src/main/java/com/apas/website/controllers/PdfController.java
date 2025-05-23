package com.apas.website.controllers;

import com.apas.website.entities.PortfolioEntity;
import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.PdfGenerationResponse;
// PortfolioResponse is used for ownership check, but we might need PortfolioEntity for storage
// import com.apas.website.entities.models.response.PortfolioResponse; 
import com.apas.website.repositories.PortfolioRepository; // Added for fetching PortfolioEntity
import com.apas.website.services.PdfService;
import com.apas.website.services.PdfStorageService;
import com.apas.website.services.PortfolioService; // Keep for existing logic
import com.apas.website.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.ArraySchema;

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
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.security.Principal;
import java.util.Collections;
import java.util.List;

import com.apas.website.entities.models.response.GeneratedPdfItemResponse;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api")
@Tag(name = "PDF Management", description = "APIs for generating, downloading, and listing portfolio PDFs")
@SecurityRequirement(name = "bearerAuth")
public class PdfController {

    private static final Logger logger = LoggerFactory.getLogger(PdfController.class);
    
    private final PdfService pdfService;
    private final PdfStorageService pdfStorageService;
    private final PortfolioService portfolioService; // Used for initial fetch and auth check
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository; // For fetching PortfolioEntity

    @Autowired
    public PdfController(PdfService pdfService, PdfStorageService pdfStorageService, 
                         PortfolioService portfolioService, UserRepository userRepository,
                         PortfolioRepository portfolioRepository) {
        this.pdfService = pdfService;
        this.pdfStorageService = pdfStorageService;
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
        this.portfolioRepository = portfolioRepository;
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
    @PostMapping("/portfolios/{portfolioId}/generate-pdf")
    public ResponseEntity<PdfGenerationResponse> generatePdf(
            @PathVariable String portfolioId,
            @Valid @RequestBody(required = false) PdfGenerationRequest request) {
        
        try {
            // Fetch PortfolioEntity for relationship and to get user ID for authorization
            PortfolioEntity portfolioEntity = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
            
            UserEntity userEntity = portfolioEntity.getUser();
            if (userEntity == null) {
                 throw new EntityNotFoundException("User associated with portfolio not found.");
            }

            if (!isUserAuthorized(userEntity.getUserId())) {
                throw new AccessDeniedException("You can only generate PDFs for your own portfolios");
            }
            
            PdfGenerationRequest actualRequest = (request == null) ? new PdfGenerationRequest() : request;
            
            ByteArrayOutputStream pdfContent = pdfService.generatePortfolioPdf(portfolioId, actualRequest);
            
            // Pass entities to storePdf
            String filename = pdfStorageService.storePdf(
                portfolioEntity, 
                userEntity,
                portfolioEntity.getTitle(), // Use title from entity
                pdfContent,
                actualRequest 
            );
            
            String downloadUrl = "/api/portfolios/" + portfolioId + "/download-pdf/" + filename;
            PdfGenerationResponse response = new PdfGenerationResponse("success", downloadUrl, filename);
            
            logger.info("Generated PDF for portfolio {} with filename {}", portfolioId, filename);
            return ResponseEntity.ok(response);
            
        } catch (EntityNotFoundException e) {
            logger.error("Failed to generate PDF: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new PdfGenerationResponse("error", e.getMessage(), null));
        } catch (AccessDeniedException e) {
            logger.warn("Access denied for PDF generation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new PdfGenerationResponse("error", e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new PdfGenerationResponse("error", "Failed to generate PDF: " + e.getMessage(), null));
        }
    }

    @Operation(summary = "Download portfolio PDF", 
               description = "Downloads a previously generated PDF for a portfolio by its filename")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF file", 
                     content = @Content(mediaType = "application/pdf")),
        @ApiResponse(responseCode = "404", description = "PDF not found or not generated yet"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only download PDFs for your own portfolios")
    })
    @GetMapping("/portfolios/{portfolioId}/download-pdf/{filename:.+}") // Added {filename} path variable
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String portfolioId, @PathVariable String filename) {
        try {
            // Fetch PortfolioEntity to check ownership via its associated UserEntity
            PortfolioEntity portfolioEntity = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
            
            UserEntity userEntity = portfolioEntity.getUser();
             if (userEntity == null) {
                 throw new EntityNotFoundException("User associated with portfolio not found for ownership check.");
            }

            if (!isUserAuthorized(userEntity.getUserId())) {
                throw new AccessDeniedException("You can only download PDFs for your own portfolios");
            }
            
            byte[] pdfContent = pdfStorageService.retrievePdf(portfolioId, filename);
            
            if (pdfContent == null) {
                logger.warn("PDF for portfolio {} with filename {} not found", portfolioId, filename);
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // Use the exact filename from the request for content disposition
            headers.setContentDispositionFormData("attachment", filename);
            
            logger.info("Downloading PDF for portfolio {} with filename {}", portfolioId, filename);
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
            
        } catch (EntityNotFoundException e) {
            logger.error("Failed to download PDF: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (AccessDeniedException e) {
            logger.warn("Access denied for PDF download: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            logger.error("Error downloading PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "List all generated PDFs for a user", 
               description = "Returns a list of all PDFs that have been generated for the specified user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of generated PDFs retrieved successfully", 
                     content = @Content(mediaType = "application/json", 
                                      array = @ArraySchema(schema = @Schema(implementation = GeneratedPdfItemResponse.class)))),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only list your own generated PDFs")
    })
    @GetMapping("/users/{userId}/generated-pdfs")
    public ResponseEntity<List<GeneratedPdfItemResponse>> getGeneratedPdfsForUser(@PathVariable String userId) {
        // Authorization check is critical here
        if (!isUserAuthorized(userId)) {
            logger.warn("User not authorized to access generated PDFs for user {}", userId);
            throw new AccessDeniedException("You can only list your own generated PDFs.");
        }

        try {
            List<GeneratedPdfItemResponse> generatedPdfs = pdfStorageService.getAllGeneratedPdfsByUserId(userId);
            logger.info("Retrieved {} generated PDFs for user {}", generatedPdfs.size(), userId);
            return ResponseEntity.ok(generatedPdfs);
        } catch (AccessDeniedException e) { 
            logger.warn("Access denied when listing generated PDFs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            logger.error("Error listing generated PDFs for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }
    
    private boolean isUserAuthorized(String userIdToCheck) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // Fetch the authenticated UserEntity to get its ID for comparison
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(authenticatedUser -> authenticatedUser.getUserId().equals(userIdToCheck))
                    .orElse(false);
        }
        return false;
    }

    @Operation(summary = "Delete a specific generated PDF", description = "Deletes a generated PDF by its portfolio ID and filename. Only the owner can delete.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "PDF deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - User does not own the portfolio or PDF"),
        @ApiResponse(responseCode = "404", description = "Portfolio or PDF not found")
    })
    @DeleteMapping("/portfolios/{portfolioId}/generated-pdfs/{filename:.+}") // :.+ to capture filenames with dots
    public ResponseEntity<Void> deleteGeneratedPdf(
            @PathVariable String portfolioId,
            @PathVariable String filename,
            Principal principal) {

        // Fetch authenticated user by email (which is principal.getName() for JWT)
        UserEntity authenticatedUser = userRepository.findByEmail(principal.getName()) 
                .orElseThrow(() -> {
                    logger.warn("Attempt to delete PDF by unauthenticated or unknown user: {}", principal.getName());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found. Please log in again.");
                });

        PortfolioEntity portfolio = portfolioRepository.findByPortfolioId(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found with ID: " + portfolioId));

        // Ownership check: Ensure the authenticated user owns the portfolio
        if (!portfolio.getUser().getUserId().equals(authenticatedUser.getUserId())) {
            logger.warn("User {} ({}) attempted to delete a PDF from portfolio {} owned by user {}.", 
                authenticatedUser.getUserId(), principal.getName(), portfolioId, portfolio.getUser().getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Additional check: ensure the PDF actually belongs to this portfolio and user (optional, but good practice)
        // This is implicitly handled by pdfStorageService.deletePdf if it queries by portfolioId and filename.
        // However, a specific check here could be more explicit if needed.
        
        // Check if the PDF exists before attempting deletion to provide a more specific 404 if PDF not found for that portfolio
        byte[] existingPdf = pdfStorageService.retrievePdf(portfolioId, filename);
        if (existingPdf == null) {
             logger.warn("Attempted to delete non-existent PDF with filename {} for portfolio {}.", filename, portfolioId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // PDF file not found for this portfolio
        }

        try {
            pdfStorageService.deletePdf(portfolioId, filename);
            logger.info("User {} deleted PDF with filename {} for portfolio {}.", principal.getName(), filename, portfolioId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting PDF with filename {} for portfolio {}: {}", filename, portfolioId, e.getMessage(), e);
            // Consider a more specific error response if needed, e.g., internal server error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}