package com.apas.website.services;

import java.io.ByteArrayOutputStream;
import java.util.List;
import com.apas.website.entities.PortfolioEntity;
import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.GeneratedPdfItemResponse;

/**
 * Service for storing and retrieving generated PDFs
 */
public interface PdfStorageService {
    
    /**
     * Stores a PDF for a portfolio
     * 
     * @param portfolio The portfolio entity
     * @param user The user entity
     * @param originalPortfolioTitle The title of the portfolio at the time of generation
     * @param pdfContent The PDF content
     * @param options The generation options
     * @return The filename of the stored PDF
     */
    String storePdf(PortfolioEntity portfolio, UserEntity user, String originalPortfolioTitle, ByteArrayOutputStream pdfContent, PdfGenerationRequest options);
    
    /**
     * Retrieves a PDF for a portfolio
     * 
     * @param portfolioId The portfolio ID
     * @param filename The filename of the PDF
     * @return The PDF content as byte array, or null if not found
     */
    byte[] retrievePdf(String portfolioId, String filename);
    
    /**
     * Gets the filename for a portfolio PDF
     * 
     * @param portfolioId The portfolio ID
     * @param options The generation options
     * @return The filename
     */
    String getFilename(String portfolioId, PdfGenerationRequest options);

    /**
     * Gets the filename for a portfolio PDF
     * 
     * @param portfolioId The portfolio ID
     * @return The filename
     */
    String getFilename(String portfolioId);

    /**
     * Gets the stored filename for a portfolio PDF if it exists in metadata.
     * This is preferred over getFilename if you need the exact name used at storage time.
     * 
     * @param portfolioId The portfolio ID
     * @param requestedFilename The requested filename
     * @return The stored filename, or a generated one if not found in metadata.
     */
    String getStoredFilename(String portfolioId, String requestedFilename);

    List<GeneratedPdfItemResponse> getAllGeneratedPdfsByUserId(String userId);

    void deletePdf(String portfolioId, String filename);
} 