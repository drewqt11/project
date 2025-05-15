package com.apas.website.controllers;

import com.apas.website.entities.models.request.CreatePortfolioRequest;
import com.apas.website.entities.models.request.UpdatePortfolioRequest;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.entities.models.response.PortfolioSummaryResponse;
import com.apas.website.repositories.UserRepository;
import com.apas.website.services.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Portfolio Management", description = "APIs for managing user portfolios")
@SecurityRequirement(name = "bearerAuth")
public class PortfolioController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);
    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    @Autowired
    public PortfolioController(PortfolioService portfolioService, UserRepository userRepository) {
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Create new portfolio draft", description = "Creates a new portfolio draft for a user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Portfolio created successfully", 
                     content = @Content(schema = @Schema(implementation = PortfolioResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only create portfolios for yourself")
    })
    @PostMapping("/users/{userId}/portfolios")
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @PathVariable String userId,
            @Valid @RequestBody(required = false) CreatePortfolioRequest request) {
        
        // Check if the authenticated user is trying to create a portfolio for themselves
        if (!isUserAuthorized(userId)) {
            throw new AccessDeniedException("You can only create portfolios for your own account");
        }
        
        // If request is null, create a default request with an empty title
        if (request == null) {
            request = new CreatePortfolioRequest("My Portfolio");
        }
        
        try {
            PortfolioResponse portfolio = portfolioService.createPortfolio(userId, request);
            logger.info("Created portfolio {} for user {}", portfolio.getPortfolioId(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(portfolio);
        } catch (EntityNotFoundException e) {
            logger.error("Failed to create portfolio: {}", e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Get all portfolio drafts", description = "Returns all portfolio drafts for a user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolios retrieved successfully", 
                     content = @Content(array = @ArraySchema(schema = @Schema(implementation = PortfolioSummaryResponse.class)))),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only view your own portfolios")
    })
    @GetMapping("/users/{userId}/portfolios")
    public ResponseEntity<List<PortfolioSummaryResponse>> getAllPortfolios(@PathVariable String userId) {
        // Check if the authenticated user is trying to view their own portfolios
        if (!isUserAuthorized(userId)) {
            throw new AccessDeniedException("You can only view portfolios for your own account");
        }
        
        List<PortfolioSummaryResponse> portfolios = portfolioService.getAllPortfoliosByUserId(userId);
        logger.info("Retrieved {} portfolios for user {}", portfolios.size(), userId);
        return ResponseEntity.ok(portfolios);
    }

    @Operation(summary = "Get portfolio details", description = "Returns the details of a specific portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolio retrieved successfully", 
                     content = @Content(schema = @Schema(implementation = PortfolioResponse.class))),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only view your own portfolios")
    })
    @GetMapping("/portfolios/{portfolioId}")
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable String portfolioId) {
        try {
            PortfolioResponse portfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Check if the authenticated user is trying to view their own portfolio
            if (!isUserAuthorized(portfolio.getUserId())) {
                throw new AccessDeniedException("You can only view your own portfolios");
            }
            
            logger.info("Retrieved portfolio {} for user {}", portfolioId, portfolio.getUserId());
            return ResponseEntity.ok(portfolio);
        } catch (EntityNotFoundException e) {
            logger.error("Failed to retrieve portfolio: {}", e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Update portfolio", description = "Updates a portfolio draft")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolio updated successfully", 
                     content = @Content(schema = @Schema(implementation = PortfolioResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only update your own portfolios")
    })
    @PutMapping("/portfolios/{portfolioId}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable String portfolioId,
            @Valid @RequestBody UpdatePortfolioRequest request) {
        
        try {
            // First get the portfolio to check ownership
            PortfolioResponse existingPortfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Check if the authenticated user is trying to update their own portfolio
            if (!isUserAuthorized(existingPortfolio.getUserId())) {
                throw new AccessDeniedException("You can only update your own portfolios");
            }
            
            PortfolioResponse updatedPortfolio = portfolioService.updatePortfolio(portfolioId, request);
            logger.info("Updated portfolio {} for user {}", portfolioId, updatedPortfolio.getUserId());
            return ResponseEntity.ok(updatedPortfolio);
        } catch (EntityNotFoundException e) {
            logger.error("Failed to update portfolio: {}", e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Delete portfolio", description = "Deletes a portfolio draft")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolio deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Can only delete your own portfolios")
    })
    @DeleteMapping("/portfolios/{portfolioId}")
    public ResponseEntity<Map<String, String>> deletePortfolio(@PathVariable String portfolioId) {
        try {
            // First get the portfolio to check ownership
            PortfolioResponse existingPortfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Check if the authenticated user is trying to delete their own portfolio
            if (!isUserAuthorized(existingPortfolio.getUserId())) {
                throw new AccessDeniedException("You can only delete your own portfolios");
            }
            
            portfolioService.deletePortfolio(portfolioId);
            logger.info("Deleted portfolio {} for user {}", portfolioId, existingPortfolio.getUserId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Portfolio deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            logger.error("Failed to delete portfolio: {}", e.getMessage());
            throw e;
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