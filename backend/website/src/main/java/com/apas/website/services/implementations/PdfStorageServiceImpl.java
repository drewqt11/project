package com.apas.website.services.implementations;

import com.apas.website.services.PdfStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory implementation of PdfStorageService
 * In a production environment, this should be replaced with a
 * file system or database storage solution.
 */
@Service
public class PdfStorageServiceImpl implements PdfStorageService {

    private static final Logger logger = LoggerFactory.getLogger(PdfStorageServiceImpl.class);
    private final Map<String, byte[]> pdfStorage = new ConcurrentHashMap<>();
    
    @Override
    public String storePdf(String portfolioId, ByteArrayOutputStream pdfContent) {
        String filename = getFilename(portfolioId);
        
        try {
            // Store the PDF content in memory
            pdfStorage.put(portfolioId, pdfContent.toByteArray());
            logger.info("Stored PDF for portfolio {} with filename {}", portfolioId, filename);
            return filename;
        } catch (Exception e) {
            logger.error("Error storing PDF for portfolio {}: {}", portfolioId, e.getMessage());
            throw new RuntimeException("Failed to store PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] retrievePdf(String portfolioId) {
        byte[] pdfContent = pdfStorage.get(portfolioId);
        
        if (pdfContent == null) {
            logger.warn("PDF for portfolio {} not found", portfolioId);
            return null;
        }
        
        logger.info("Retrieved PDF for portfolio {}", portfolioId);
        return pdfContent;
    }

    @Override
    public String getFilename(String portfolioId) {
        return "portfolio_" + portfolioId + ".pdf";
    }
} 