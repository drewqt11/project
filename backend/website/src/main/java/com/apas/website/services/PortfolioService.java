package com.apas.website.services;

import com.apas.website.entities.models.request.CreatePortfolioRequest;
import com.apas.website.entities.models.request.UpdatePortfolioRequest;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.entities.models.response.PortfolioSummaryResponse;

import java.util.List;

public interface PortfolioService {
    
    /**
     * Creates a new portfolio for a user
     * 
     * @param userId User ID
     * @param request Portfolio creation request
     * @return The created portfolio
     */
    PortfolioResponse createPortfolio(String userId, CreatePortfolioRequest request);
    
    /**
     * Gets all portfolios for a user
     * 
     * @param userId User ID
     * @return List of portfolio summaries
     */
    List<PortfolioSummaryResponse> getAllPortfoliosByUserId(String userId);
    
    /**
     * Gets a specific portfolio by ID
     * 
     * @param portfolioId Portfolio ID
     * @return The portfolio details
     */
    PortfolioResponse getPortfolioById(String portfolioId);
    
    /**
     * Updates a portfolio
     * 
     * @param portfolioId Portfolio ID
     * @param request Portfolio update request
     * @return The updated portfolio
     */
    PortfolioResponse updatePortfolio(String portfolioId, UpdatePortfolioRequest request);
    
    /**
     * Deletes a portfolio
     * 
     * @param portfolioId Portfolio ID
     * @return Success status
     */
    boolean deletePortfolio(String portfolioId);
} 