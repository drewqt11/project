package com.apas.website.services.implementations;

import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.services.PdfService;
import com.apas.website.services.PortfolioService;

import jakarta.persistence.EntityNotFoundException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PdfServiceImpl implements PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfServiceImpl.class);
    private final PortfolioService portfolioService;
    private final ObjectMapper objectMapper;

    @Autowired
    public PdfServiceImpl(PortfolioService portfolioService, ObjectMapper objectMapper) {
        this.portfolioService = portfolioService;
        this.objectMapper = objectMapper;
    }

    @Override
    public ByteArrayOutputStream generatePortfolioPdf(String portfolioId) {
        return generatePortfolioPdf(portfolioId, new PdfGenerationRequest());
    }
    
    @Override
    public ByteArrayOutputStream generatePortfolioPdf(String portfolioId, PdfGenerationRequest options) {
        try {
            // Get portfolio data
            PortfolioResponse portfolio = portfolioService.getPortfolioById(portfolioId);
            
            // Convert portfolio data to HTML with customization options
            String html = generateHtmlFromPortfolio(portfolio, options);
            
            // Convert HTML to XHTML for Flying Saucer
            String xhtml = convertToXhtml(html);
            
            // Convert XHTML to PDF
            return convertToPdf(xhtml);
            
        } catch (EntityNotFoundException e) {
            logger.error("Portfolio not found with ID: {}", portfolioId);
            throw e;
        } catch (Exception e) {
            logger.error("Error generating PDF for portfolio {}: {}", portfolioId, e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generates HTML from portfolio data with customization options
     * 
     * @param portfolio The portfolio data
     * @param options Customization options
     * @return HTML string
     */
    @SuppressWarnings("unchecked")
    private String generateHtmlFromPortfolio(PortfolioResponse portfolio, PdfGenerationRequest options) {
        try {
            StringBuilder html = new StringBuilder();
            
            // Extract customization options with defaults
            String primaryColor = options.getPrimaryColor() != null ? options.getPrimaryColor() : "#2d5f9a";
            String secondaryColor = options.getSecondaryColor() != null ? options.getSecondaryColor() : "#4a7fb5";
            String fontFamily = options.getFontFamily() != null ? options.getFontFamily() : "Arial, sans-serif";
            Boolean includeFooter = options.getIncludeFooter() != null ? options.getIncludeFooter() : true;
            
            // Create HTML structure
            html.append("<!DOCTYPE html>");
            html.append("<html lang=\"en\">");
            html.append("<head>");
            html.append("<meta charset=\"UTF-8\">");
            html.append("<title>").append(portfolio.getTitle()).append("</title>");
            html.append("<style>");
            html.append("body { font-family: ").append(fontFamily).append("; margin: 0; padding: 20px; color: #333; }");
            html.append("h1 { color: ").append(primaryColor).append("; font-size: 26px; margin-bottom: 20px; text-align: center; }");
            html.append("h2 { color: ").append(secondaryColor).append("; font-size: 22px; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }");
            html.append("p { line-height: 1.6; margin: 10px 0; }");
            html.append(".section { margin-bottom: 30px; }");
            html.append(".header { text-align: center; margin-bottom: 30px; }");
            html.append(".personal-info { display: flex; flex-direction: column; }");
            html.append(".personal-info p { margin: 5px 0; }");
            html.append(".employment { margin-bottom: 20px; }");
            html.append(".employment h3 { margin: 0; font-size: 18px; color: ").append(primaryColor).append("; }");
            html.append(".employment p { margin: 5px 0; }");
            html.append(".education { margin-bottom: 20px; }");
            html.append(".skills-category { margin-bottom: 15px; }");
            html.append(".skills-category h3 { margin: 0; font-size: 18px; color: ").append(primaryColor).append("; }");
            html.append(".skills-list { display: flex; flex-wrap: wrap; }");
            html.append(".skill-item { background: #e9f0f7; margin: 5px; padding: 5px 10px; border-radius: 3px; }");
            html.append(".project { margin-bottom: 20px; }");
            html.append(".project h3 { margin: 0; font-size: 18px; color: ").append(primaryColor).append("; }");
            html.append(".project p { margin: 5px 0; }");
            html.append(".footer { text-align: center; font-size: 12px; color: #999; margin-top: 50px; }");
            html.append("</style>");
            html.append("</head>");
            html.append("<body>");
            
            // Header section
            html.append("<div class=\"header\">");
            html.append("<h1>").append(portfolio.getTitle()).append("</h1>");
            html.append("</div>");
            
            // Personal Information
            if (portfolio.getPersonalInformation() != null) {
                html.append("<div class=\"section\">");
                html.append("<h2>Personal Information</h2>");
                html.append("<div class=\"personal-info\">");
                
                Map<String, Object> personalInfo = objectMapper.readValue(
                    portfolio.getPersonalInformation().toString(), 
                    Map.class
                );
                
                if (personalInfo.containsKey("fullName")) {
                    html.append("<p><strong>Name:</strong> ").append(personalInfo.get("fullName")).append("</p>");
                }
                if (personalInfo.containsKey("email")) {
                    html.append("<p><strong>Email:</strong> ").append(personalInfo.get("email")).append("</p>");
                }
                if (personalInfo.containsKey("phone")) {
                    html.append("<p><strong>Phone:</strong> ").append(personalInfo.get("phone")).append("</p>");
                }
                if (personalInfo.containsKey("address")) {
                    html.append("<p><strong>Address:</strong> ").append(personalInfo.get("address")).append("</p>");
                }
                if (personalInfo.containsKey("summary")) {
                    html.append("<p><strong>Summary:</strong> ").append(personalInfo.get("summary")).append("</p>");
                }
                
                html.append("</div>");
                html.append("</div>");
            }
            
            // Employment History
            if (portfolio.getEmploymentHistory() != null) {
                html.append("<div class=\"section\">");
                html.append("<h2>Employment History</h2>");
                
                Object[] employmentHistory = objectMapper.readValue(
                    portfolio.getEmploymentHistory().toString(), 
                    Object[].class
                );
                
                for (Object job : employmentHistory) {
                    Map<String, Object> jobDetails = objectMapper.convertValue(job, Map.class);
                    
                    html.append("<div class=\"employment\">");
                    html.append("<h3>").append(jobDetails.getOrDefault("position", "")).append(" at ")
                        .append(jobDetails.getOrDefault("company", "")).append("</h3>");
                    html.append("<p>").append(jobDetails.getOrDefault("startDate", "")).append(" - ")
                        .append(jobDetails.getOrDefault("endDate", "")).append("</p>");
                    html.append("<p>").append(jobDetails.getOrDefault("description", "")).append("</p>");
                    html.append("</div>");
                }
                
                html.append("</div>");
            }
            
            // Educational Background
            if (portfolio.getEducationalBackground() != null) {
                html.append("<div class=\"section\">");
                html.append("<h2>Education</h2>");
                
                Object[] education = objectMapper.readValue(
                    portfolio.getEducationalBackground().toString(), 
                    Object[].class
                );
                
                for (Object edu : education) {
                    Map<String, Object> eduDetails = objectMapper.convertValue(edu, Map.class);
                    
                    html.append("<div class=\"education\">");
                    html.append("<h3>").append(eduDetails.getOrDefault("degree", "")).append("</h3>");
                    html.append("<p><strong>Institution:</strong> ").append(eduDetails.getOrDefault("institution", "")).append("</p>");
                    html.append("<p><strong>Year:</strong> ").append(eduDetails.getOrDefault("year", "")).append("</p>");
                    if (eduDetails.containsKey("gpa")) {
                        html.append("<p><strong>GPA:</strong> ").append(eduDetails.get("gpa")).append("</p>");
                    }
                    html.append("</div>");
                }
                
                html.append("</div>");
            }
            
            // Skills
            if (portfolio.getSkills() != null) {
                html.append("<div class=\"section\">");
                html.append("<h2>Skills</h2>");
                
                Object[] skills = objectMapper.readValue(
                    portfolio.getSkills().toString(), 
                    Object[].class
                );
                
                for (Object skillCategory : skills) {
                    Map<String, Object> category = objectMapper.convertValue(skillCategory, Map.class);
                    
                    html.append("<div class=\"skills-category\">");
                    html.append("<h3>").append(category.getOrDefault("category", "")).append("</h3>");
                    html.append("<div class=\"skills-list\">");
                    
                    if (category.containsKey("items")) {
                        Object[] items = objectMapper.convertValue(category.get("items"), Object[].class);
                        for (Object item : items) {
                            html.append("<span class=\"skill-item\">").append(item).append("</span>");
                        }
                    }
                    
                    html.append("</div>");
                    html.append("</div>");
                }
                
                html.append("</div>");
            }
            
            // Project Showcases
            if (portfolio.getProjectShowcases() != null) {
                html.append("<div class=\"section\">");
                html.append("<h2>Projects</h2>");
                
                Object[] projects = objectMapper.readValue(
                    portfolio.getProjectShowcases().toString(), 
                    Object[].class
                );
                
                for (Object proj : projects) {
                    Map<String, Object> project = objectMapper.convertValue(proj, Map.class);
                    
                    html.append("<div class=\"project\">");
                    html.append("<h3>").append(project.getOrDefault("title", "")).append("</h3>");
                    html.append("<p>").append(project.getOrDefault("description", "")).append("</p>");
                    
                    if (project.containsKey("technologies")) {
                        html.append("<p><strong>Technologies:</strong> ");
                        Object[] techs = objectMapper.convertValue(project.get("technologies"), Object[].class);
                        for (int i = 0; i < techs.length; i++) {
                            html.append(techs[i]);
                            if (i < techs.length - 1) {
                                html.append(", ");
                            }
                        }
                        html.append("</p>");
                    }
                    
                    if (project.containsKey("link")) {
                        html.append("<p><strong>Link:</strong> ").append(project.get("link")).append("</p>");
                    }
                    
                    html.append("</div>");
                }
                
                html.append("</div>");
            }
            
            // Footer
            if (includeFooter) {
                html.append("<div class=\"footer\">");
                html.append("<p>Generated on ").append(java.time.LocalDate.now()).append("</p>");
                html.append("</div>");
            }
            
            html.append("</body>");
            html.append("</html>");
            
            return html.toString();
            
        } catch (Exception e) {
            logger.error("Error generating HTML: {}", e.getMessage());
            throw new RuntimeException("Failed to generate HTML: " + e.getMessage(), e);
        }
    }
    
    /**
     * Converts HTML to XHTML for Flying Saucer processing
     * 
     * @param html HTML string
     * @return XHTML string
     */
    private String convertToXhtml(String html) {
        Document document = Jsoup.parse(html);
        document.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        return document.html();
    }
    
    /**
     * Converts XHTML to PDF
     * 
     * @param xhtml XHTML string
     * @return PDF as ByteArrayOutputStream
     */
    private ByteArrayOutputStream convertToPdf(String xhtml) {
        try {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(xhtml);
            renderer.layout();
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            renderer.createPDF(outputStream);
            outputStream.close();
            
            return outputStream;
        } catch (IOException e) {
            logger.error("Error creating PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to create PDF: " + e.getMessage(), e);
        }
    }
} 