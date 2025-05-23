package com.apas.website.services.implementations;

import com.apas.website.entities.GeneratedPdf;
import com.apas.website.entities.PortfolioEntity;
import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.GeneratedPdfItemResponse;
import com.apas.website.entities.models.response.PdfStyleOptionsResponse;
import com.apas.website.repositories.GeneratedPdfRepository;
import com.apas.website.services.PdfStorageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * In-memory implementation of PdfStorageService
 * In a production environment, this should be replaced with a
 * file system or database storage solution.
 */
@Service
public class PdfStorageServiceImpl implements PdfStorageService {

    private static final Logger logger = LoggerFactory.getLogger(PdfStorageServiceImpl.class);
    private final GeneratedPdfRepository generatedPdfRepository;
    private final ObjectMapper objectMapper; // For converting PdfGenerationRequest to Map
    private static final DateTimeFormatter FILENAME_TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    @Autowired
    public PdfStorageServiceImpl(GeneratedPdfRepository generatedPdfRepository, ObjectMapper objectMapper) {
        this.generatedPdfRepository = generatedPdfRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public String storePdf(PortfolioEntity portfolio, UserEntity user, String originalPortfolioTitle, ByteArrayOutputStream pdfContent, PdfGenerationRequest options) {
        String filename = getFilename(portfolio.getPortfolioId(), options);
        byte[] pdfBytes = pdfContent.toByteArray();
        OffsetDateTime generatedAt = OffsetDateTime.now(ZoneOffset.UTC);

        Map<String, Object> styleOptionsMap = null;
        if (options != null) {
            try {
                styleOptionsMap = objectMapper.convertValue(options, new TypeReference<Map<String, Object>>() {});
            } catch (IllegalArgumentException e) {
                logger.warn("Could not convert PdfGenerationRequest options to Map for storing: {}", e.getMessage());
            }
        }

        GeneratedPdf generatedPdf = GeneratedPdf.builder()
            .portfolio(portfolio)
            .user(user)
            .customDisplayName(options != null ? options.getCustomPdfName() : null)
            .originalPortfolioTitle(originalPortfolioTitle)
            .filename(filename)
            .generatedAt(generatedAt)
            .fileSizeBytes((long) pdfBytes.length)
            .pdfContent(pdfBytes)
            .styleOptions(styleOptionsMap)
            .build();

        try {
            GeneratedPdf savedPdf = generatedPdfRepository.save(generatedPdf);
            logger.info("Stored PDF for portfolio {} (DB ID: {}, User: {}, Custom Name: '{}', Title: '{}', Filename: {}) in database.", 
                        portfolio.getPortfolioId(), 
                        savedPdf.getPdfId(), 
                        user.getUserId(), 
                        savedPdf.getCustomDisplayName(),
                        originalPortfolioTitle, 
                        filename);
            return filename;
        } catch (Exception e) {
            logger.error("Error storing PDF for portfolio {} in database: {}", portfolio.getPortfolioId(), e.getMessage());
            throw new RuntimeException("Failed to store PDF in database: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] retrievePdf(String portfolioId, String filename) {
        Optional<GeneratedPdf> pdfOptional = generatedPdfRepository.findByPortfolioPortfolioIdAndFilename(portfolioId, filename);

        if (pdfOptional.isPresent()) {
            GeneratedPdf pdf = pdfOptional.get();
            logger.info("Retrieved PDF for portfolio {} (filename: {}) from database.", portfolioId, pdf.getFilename());
            return pdf.getPdfContent();
        }
        logger.warn("PDF for portfolio {} (filename: {}) not found in database.", portfolioId, filename);
        return null;
    }

    @Override
    public String getFilename(String portfolioId, PdfGenerationRequest options) {
        String timestamp = FILENAME_TIMESTAMP_FORMATTER.format(OffsetDateTime.now(ZoneOffset.UTC));
        String basePortfolioId = portfolioId.replaceAll("[^a-zA-Z0-9.-]", "_");
        
        if (options != null && StringUtils.hasText(options.getCustomPdfName())) {
            String sanitizedCustomName = options.getCustomPdfName().replaceAll("[^a-zA-Z0-9.-]", "_").trim();
            if (sanitizedCustomName.length() > 50) { // Truncate if too long
                sanitizedCustomName = sanitizedCustomName.substring(0, 50);
            }
            if (!sanitizedCustomName.isEmpty()) {
                return "portfolio_" + basePortfolioId + "_" + sanitizedCustomName + "_" + timestamp + ".pdf";
            }
        }
        return "portfolio_" + basePortfolioId + "_" + timestamp + ".pdf";
    }

    @Override
    @Transactional(readOnly = true)
    public String getStoredFilename(String portfolioId, String requestedFilename) {
        Optional<GeneratedPdf> pdfOptional;
        if (requestedFilename != null && !requestedFilename.isEmpty()) {
            pdfOptional = generatedPdfRepository.findByPortfolioPortfolioIdAndFilename(portfolioId, requestedFilename);
        } else {
            pdfOptional = generatedPdfRepository.findFirstByPortfolioPortfolioIdOrderByGeneratedAtDesc(portfolioId);
        }
        return pdfOptional.map(GeneratedPdf::getFilename).orElseGet(() -> getFilename(portfolioId, null));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GeneratedPdfItemResponse> getAllGeneratedPdfsByUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            logger.warn("getAllGeneratedPdfsByUserId called with null or empty userId.");
            return List.of();
        }
        logger.info("Fetching all generated PDFs for user ID: {}", userId);
        List<GeneratedPdf> userPdfs = generatedPdfRepository.findByUserUserIdOrderByGeneratedAtDesc(userId);

        List<GeneratedPdfItemResponse> responseItems = userPdfs.stream()
            .map(pdf -> {
                PdfStyleOptionsResponse styleOptsResponse = null;
                if (pdf.getStyleOptions() != null) {
                    try {
                        styleOptsResponse = objectMapper.convertValue(pdf.getStyleOptions(), PdfStyleOptionsResponse.class);
                    } catch (IllegalArgumentException e) {
                        logger.warn("Could not deserialize styleOptions for PDF ID {}: {}", pdf.getPdfId(), e.getMessage());
                    }
                }
                return new GeneratedPdfItemResponse(
                    pdf.getPdfId(),
                    pdf.getPortfolio().getPortfolioId(),
                    pdf.getCustomDisplayName(),
                    pdf.getOriginalPortfolioTitle(),
                    pdf.getFilename(),
                    "/api/portfolios/" + pdf.getPortfolio().getPortfolioId() + "/download-pdf/" + pdf.getFilename(), 
                    pdf.getGeneratedAt().toInstant(),
                    pdf.getFileSizeBytes(),
                    styleOptsResponse
                );
            })
            .collect(Collectors.toList());

        if (responseItems.isEmpty()) {
            logger.info("No generated PDFs found in database for user ID: {}", userId);
        } else {
            logger.info("Found {} generated PDF(s) in database for user ID: {}", responseItems.size(), userId);
        }
        return responseItems;
    }

    @Override
    @Transactional
    public void deletePdf(String portfolioId, String filename) {
        Optional<GeneratedPdf> pdfOptional = generatedPdfRepository.findByPortfolioPortfolioIdAndFilename(portfolioId, filename);
        if (pdfOptional.isPresent()) {
            generatedPdfRepository.delete(pdfOptional.get());
            logger.info("Deleted PDF for portfolio {} with filename {} from database.", portfolioId, filename);
        } else {
            logger.warn("Attempted to delete PDF for portfolio {} with filename {}, but it was not found.", portfolioId, filename);
        }
    }

    @Override
    public String getFilename(String portfolioId) {
        String timestamp = FILENAME_TIMESTAMP_FORMATTER.format(OffsetDateTime.now(ZoneOffset.UTC));
        return "portfolio_" + portfolioId.replaceAll("[^a-zA-Z0-9.-]", "_") + "_" + timestamp + ".pdf";
    }
} 