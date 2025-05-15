package com.apas.website.services;

import java.io.ByteArrayOutputStream;

/**
 * Service for storing and retrieving generated PDFs
 */
public interface PdfStorageService {
    
    /**
     * Stores a PDF for a portfolio
     * 
     * @param portfolioId The portfolio ID
     * @param pdfContent The PDF content
     * @return The filename of the stored PDF
     */
    String storePdf(String portfolioId, ByteArrayOutputStream pdfContent);
    
    /**
     * Retrieves a PDF for a portfolio
     * 
     * @param portfolioId The portfolio ID
     * @return The PDF content as byte array, or null if not found
     */
    byte[] retrievePdf(String portfolioId);
    
    /**
     * Gets the filename for a portfolio PDF
     * 
     * @param portfolioId The portfolio ID
     * @return The filename
     */
    String getFilename(String portfolioId);
} 