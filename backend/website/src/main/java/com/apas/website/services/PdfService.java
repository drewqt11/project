package com.apas.website.services;

import java.io.ByteArrayOutputStream;

import com.apas.website.entities.models.request.PdfGenerationRequest;

/**
 * Service for generating PDF files from portfolio data
 */
public interface PdfService {
    
    /**
     * Generates a PDF for a portfolio with default settings
     * 
     * @param portfolioId The ID of the portfolio to generate PDF for
     * @return The generated PDF as a byte array output stream
     */
    ByteArrayOutputStream generatePortfolioPdf(String portfolioId);
    
    /**
     * Generates a PDF for a portfolio with customization options
     * 
     * @param portfolioId The ID of the portfolio to generate PDF for
     * @param options Customization options for the PDF
     * @return The generated PDF as a byte array output stream
     */
    ByteArrayOutputStream generatePortfolioPdf(String portfolioId, PdfGenerationRequest options);
} 