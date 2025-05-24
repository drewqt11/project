package com.apas.website.services.implementations;

import com.apas.website.entities.models.request.PdfGenerationRequest;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.services.PdfService;
import com.apas.website.services.PortfolioService;
import com.fasterxml.jackson.core.type.TypeReference;

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
import java.util.List;

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
    @SuppressWarnings({ "unused", "unchecked" })
    private String generateHtmlFromPortfolio(PortfolioResponse portfolio, PdfGenerationRequest options) {
        try {
            StringBuilder html = new StringBuilder();
            
            String primaryColor = options.getPrimaryColor() != null && !options.getPrimaryColor().isEmpty() ? options.getPrimaryColor() : "#004A70"; 
            String secondaryColor = options.getSecondaryColor() != null && !options.getSecondaryColor().isEmpty() ? options.getSecondaryColor() : "#555555"; 
            String fontFamily = options.getFontFamily() != null && !options.getFontFamily().isEmpty() ? options.getFontFamily() : "\"Helvetica Neue\", Helvetica, Arial, sans-serif";
            Boolean includeFooter = options.getIncludeFooter() != null ? options.getIncludeFooter() : true;
            
            String bodyTextColor = "#333333";
            String lightGrayBorder = "#dddddd"; // For the border below contact info

            html.append("<!DOCTYPE html>");
            html.append("<html lang=\"en\">");
            html.append("<head>");
            html.append("<meta charset=\"UTF-8\">");
            html.append("<title>").append(portfolio.getTitle()).append("</title>");
            html.append("<style>");
            html.append("body { font-family: ").append(fontFamily).append("; margin: 0; padding: 0; background-color: #fff; color: ").append(bodyTextColor).append("; font-size: 10pt; line-height: 1.4;}");
            html.append(".container { width: 90%; margin: 0 auto; padding: 30px 25px; }");
            
            // Header: Full Name and Contact Info
            html.append(".header-fullname { font-size: 30pt; font-weight: bold; color: ").append(primaryColor).append("; margin: 0 0 10px 0; line-height: 1.1; }");
            html.append(".contact-block { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid ").append(lightGrayBorder).append("; }");
            html.append(".contact-item { font-size: 9pt; color: ").append(secondaryColor).append("; margin-bottom: 2px; display: flex; }");
            html.append(".contact-item strong { font-weight: bold; color: ").append(bodyTextColor).append("; width: 70px; /* Fixed width for labels */ display: inline-block; }");

            // General section styling
            html.append(".section { margin-bottom: 20px; }");
            html.append(".section-title { font-size: 13pt; font-weight: bold; color: ").append(primaryColor).append("; margin-top: 0; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 2px solid ").append(primaryColor).append("; text-transform: uppercase; letter-spacing: 0.5px;}");
            
            // Professional Summary
            html.append(".summary-text p { margin: 0 0 10px 0; text-align: left; overflow-wrap: break-word; word-wrap: break-word; }");

            // Employment & Education entries - General
            html.append(".entry { margin-bottom: 15px; }");
            html.append(".entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px; }"); // align-items to flex-start
            html.append(".entry-left-column { flex-grow: 1; }"); // Column for title/subtitle
            html.append(".entry-title { font-size: 11pt; font-weight: bold; color: ").append(bodyTextColor).append("; display: block;}"); // was span, now block for edu
            html.append(".entry-subtitle { font-size: 10pt; color: ").append(secondaryColor).append("; display: block;}"); // was span, now block for edu, removed italic
            html.append(".employment-detail-line { font-size: 11pt;}"); // For "Company, Position" on one line
            html.append(".employment-company { font-weight: bold; color: ").append(bodyTextColor).append("; }");
            html.append(".employment-position { color: ").append(bodyTextColor).append("; }"); // Removed italic from here, was not used for position

            html.append(".entry-dates { font-size: 9pt; color: ").append(secondaryColor).append("; text-align: right; white-space: nowrap; min-width: 120px; padding-left:10px; }"); // min-width for date alignment
            html.append(".entry-description { margin-left: 0px; } ");
            html.append(".entry-description p, .entry-description ul { margin: 3px 0 5px 15px; font-size: 10pt; }"); 
            html.append(".entry-description ul { padding-left: 15px; list-style-position: outside; }");
            html.append(".entry-description li { margin-bottom: 3px; }");

            // Skills section
            html.append(".skills-block { margin-left: 0; padding-left: 0; } /* Ensure no extra indent for the block itself */");
            html.append(".skill-entry { margin-bottom: 4px; font-size: 10pt; display: flex; align-items: flex-start; }");
            html.append(".skill-bullet { margin-right: 5px; color: ").append(bodyTextColor).append("; font-weight: bold; display: inline-block; width: 10px; /* Ensures space for bullet */ }");
            html.append(".skill-line-content { flex-grow: 1; }"); // To contain title and items
            html.append(".skill-category-title { font-weight: bold; font-size: 10pt; color: ").append(bodyTextColor).append("; }");
            html.append(".skill-items { font-size: 10pt; color: ").append(secondaryColor).append("; }");

            // Projects section
            html.append(".project { margin-bottom: 15px; }");
            html.append(".project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }");
            html.append(".project-title { font-size: 11pt; font-weight: bold; color: ").append(bodyTextColor).append("; }");
            html.append(".project-description { margin-left: 0px; }"); /* Consistent with .entry-description */
            html.append(".project-description p, .project-description ul { margin: 5px 0 5px 15px; font-size: 10pt; }");
            html.append(".project-description ul { padding-left: 15px; list-style-position: outside; }");
            html.append(".project-tech, .project-link { font-size: 9pt; color: ").append(secondaryColor).append("; margin-top: 3px; margin-left: 15px; }");
            html.append(".project-link a { color: ").append(primaryColor).append("; text-decoration: none; }");
            html.append(".project-link a:hover { text-decoration: underline; }");

            html.append(".footer { text-align: center; font-size: 8pt; color: #999; margin-top: 30px; padding-top: 10px; border-top: 1px solid ").append(lightGrayBorder).append("; }");
            html.append("</style>");
            html.append("</head>");
            html.append("<body>");
            html.append("<div class=\"container\">");
            
            String fullName = "FULL NAME NOT PROVIDED"; // Default full name
            Map<String, Object> personalInfoForHeader = null;
            if (portfolio.getPersonalInformation() != null) {
                try {
                    personalInfoForHeader = objectMapper.readValue(
                    portfolio.getPersonalInformation().toString(), 
                    Map.class
                );
                    if (personalInfoForHeader.containsKey("fullName") && personalInfoForHeader.get("fullName") != null && !personalInfoForHeader.get("fullName").toString().trim().isEmpty()) {
                        fullName = personalInfoForHeader.get("fullName").toString().trim();
                    }
                } catch (Exception e) {
                    logger.warn("Could not parse personalInformation for full name: {}", e.getMessage());
                }
            }
            html.append("<h1 class=\"header-fullname\">").append(fullName).append("</h1>");

            // Contact Information Block
            if (personalInfoForHeader != null) {
                html.append("<div class=\"contact-block\">");
                if (personalInfoForHeader.containsKey("address") && personalInfoForHeader.get("address") != null && !personalInfoForHeader.get("address").toString().trim().isEmpty()) {
                    html.append("<div class=\"contact-item\"><strong>Address:</strong><span>")
                        .append(personalInfoForHeader.get("address").toString().trim()).append("</span></div>");
                }
                if (personalInfoForHeader.containsKey("phone") && personalInfoForHeader.get("phone") != null && !personalInfoForHeader.get("phone").toString().trim().isEmpty()) {
                    html.append("<div class=\"contact-item\"><strong>Phone:</strong><span>")
                        .append(personalInfoForHeader.get("phone").toString().trim()).append("</span></div>");
                }
                if (personalInfoForHeader.containsKey("email") && personalInfoForHeader.get("email") != null && !personalInfoForHeader.get("email").toString().trim().isEmpty()) {
                    html.append("<div class=\"contact-item\"><strong>Email:</strong><span>")
                        .append(personalInfoForHeader.get("email").toString().trim()).append("</span></div>");
                }
                if (personalInfoForHeader.containsKey("website") && personalInfoForHeader.get("website") != null && !personalInfoForHeader.get("website").toString().trim().isEmpty()) {
                    html.append("<div class=\"contact-item\"><strong>Website:</strong><span>")
                        .append(personalInfoForHeader.get("website").toString().trim()).append("</span></div>");
                } else if (personalInfoForHeader.containsKey("linkedin") && personalInfoForHeader.get("linkedin") != null && !personalInfoForHeader.get("linkedin").toString().trim().isEmpty()) {
                    html.append("<div class=\"contact-item\"><strong>LinkedIn:</strong><span>")
                        .append(personalInfoForHeader.get("linkedin").toString().trim()).append("</span></div>");
                }
                html.append("</div>"); // End contact-block
            }
            
            // Professional Summary (from Personal Information's summary field)
            if (portfolio.getPersonalInformation() != null) {
                try {
                    Map<String, Object> personalInfo = objectMapper.readValue(
                        portfolio.getPersonalInformation().toString(), 
                        Map.class
                    );
                    if (personalInfo.containsKey("summary") && personalInfo.get("summary") != null && !personalInfo.get("summary").toString().isEmpty()) {
                        html.append("<div class=\"section\">");
                        html.append("<h2 class=\"section-title\">Professional Summary</h2>");
                        html.append("<div class=\"summary-text\">");
                        html.append("<p>").append(personalInfo.get("summary").toString()).append("</p>");
                html.append("</div>");
                html.append("</div>");
                    }
                } catch (Exception e) {
                    logger.warn("Could not parse personalInformation for summary: {}", e.getMessage());
                }
            }
            
            // Employment History
            if (portfolio.getEmploymentHistory() != null) {
                Object[] employmentHistory = objectMapper.readValue(
                    portfolio.getEmploymentHistory().toString(), 
                    Object[].class
                );

                if (employmentHistory != null && employmentHistory.length > 0) {
                    html.append("<div class=\"section\">");
                    html.append("<h2 class=\"section-title\">Employment History</h2>");
                    
                    for (Object job : employmentHistory) {
                        Map<String, Object> jobDetails = objectMapper.convertValue(job, Map.class);
                        
                        html.append("<div class=\"entry\">");
                        html.append("<div class=\"entry-header\">");
                        html.append("<div class=\"entry-left-column\">"); 
                        
                        String company = jobDetails.getOrDefault("company", "").toString().trim();
                        String position = jobDetails.getOrDefault("position", "").toString().trim();
                        html.append("<div class=\"employment-detail-line\">");
                        if (!company.isEmpty()) {
                            html.append("<span class=\"employment-company\">").append(company).append("</span>");
                            if (!position.isEmpty()) {
                                html.append(", ");
                            }
                        }
                        if (!position.isEmpty()) {
                            html.append("<span class=\"employment-position\">").append(position).append("</span>");
                        }
                        html.append("</div>"); // End employment-detail-line

                        html.append("</div>"); // End entry-left-column
                        
                        String startDate = jobDetails.getOrDefault("startDate", "").toString();
                        String endDate = jobDetails.getOrDefault("endDate", "").toString();
                        String dateRange = "";
                        if (!startDate.isEmpty() && !endDate.isEmpty()) {
                            dateRange = startDate + " - " + endDate;
                        } else if (!startDate.isEmpty()) {
                            dateRange = startDate;
                        } else if (!endDate.isEmpty()) {
                            dateRange = endDate;
                        }
                        html.append("<span class=\"entry-dates\">").append(dateRange).append("</span>");
                        html.append("</div>"); // End entry-header
                        
                        String description = jobDetails.getOrDefault("description", "").toString();
                        if (!description.isEmpty()) {
                            html.append("<div class=\"entry-description\">");
                            // Attempt to convert bullet points from plain text (e.g., lines starting with * or -)
                            if (description.contains("\n")) { // Assuming newlines separate points
                                 html.append("<ul>");
                                 for (String line : description.split("\n")) {
                                     if (!line.trim().isEmpty()) {
                                         html.append("<li>").append(line.trim().replaceAll("^[-*]\s*", "")).append("</li>");
                                     }
                                 }
                                 html.append("</ul>");
                            } else {
                                 html.append("<p>").append(description).append("</p>");
                            }
                            html.append("</div>"); // End entry-description
                        }
                        html.append("</div>"); // End entry
                    }
                    
                    html.append("</div>");
                } // End if employmentHistory is not empty
            }
            
            // Educational Background
            if (portfolio.getEducationalBackground() != null) {
                Object[] education = objectMapper.readValue(
                    portfolio.getEducationalBackground().toString(), 
                    Object[].class
                );

                if (education != null && education.length > 0) {
                    html.append("<div class=\"section\">");
                    html.append("<h2 class=\"section-title\">Education</h2>");
                    
                    for (Object edu : education) {
                        Map<String, Object> eduDetails = objectMapper.convertValue(edu, Map.class);
                        
                        html.append("<div class=\"entry\">");
                        html.append("<div class=\"entry-header\">");
                        html.append("<div class=\"entry-left-column\">");
                        html.append("<span class=\"entry-title\">").append(eduDetails.getOrDefault("degree", "")).append("</span>");
                        if (eduDetails.containsKey("institution") && eduDetails.get("institution") != null && !eduDetails.get("institution").toString().trim().isEmpty()) {
                            html.append("<span class=\"entry-subtitle\">").append(eduDetails.get("institution")).append("</span>");
                        }
                        html.append("</div>"); // End entry-left-column
                        
                        String startDate = eduDetails.getOrDefault("startDate", "").toString().trim();
                        String endDate = eduDetails.getOrDefault("endDate", "").toString().trim();
                        String dateRange = "";

                        if (!startDate.isEmpty()) {
                            dateRange += startDate;
                            if (!endDate.isEmpty() && !endDate.equalsIgnoreCase("present") && !endDate.equals(startDate)) {
                                dateRange += " - " + endDate;
                            } else if (endDate.equalsIgnoreCase("present")) {
                                dateRange += " - Present";
                            } else if (endDate.equals(startDate) && !endDate.equalsIgnoreCase("present")) {
                                // If start and end are same year, and not present, just show start year
                                // Date range is already just startDate
                            }
                        } else if (!endDate.isEmpty()) {
                            // Only end date is present (e.g. "Present" or a single year for completion)
                            dateRange = endDate;
                        }

                        html.append("<span class=\"entry-dates\">").append(dateRange).append("</span>"); 
                        html.append("</div>"); // End entry-header
                        
                        html.append("</div>"); // End entry
                    }
                    
                    html.append("</div>");
                } // End if education is not empty
            }
            
            // Skills
            if (portfolio.getSkills() != null) {
                Object[] skills = objectMapper.readValue(
                    portfolio.getSkills().toString(), 
                    Object[].class
                );

                if (skills != null && skills.length > 0) {
                    html.append("<div class=\"section\">");
                    html.append("<h2 class=\"section-title\">Skills</h2>");
                    
                    html.append("<div class=\"skills-block\">");
                    for (Object skillCategoryObj : skills) {
                        Map<String, Object> category = objectMapper.convertValue(skillCategoryObj, Map.class);
                        String categoryTitle = category.getOrDefault("category", "").toString().trim();
                        
                        StringBuilder skillLineContent = new StringBuilder();
                        boolean hasContentForThisLine = false;

                        if (!categoryTitle.isEmpty()){
                             skillLineContent.append("<span class=\"skill-category-title\">").append(categoryTitle).append(": </span>");
                             // hasContentForThisLine = true; // We will check based on final content
                        }
                        
                        if (category.containsKey("items")) {
                            try {
                                List<Map<String, String>> itemsList = objectMapper.convertValue(category.get("items"), List.class);
                                StringBuilder itemsString = new StringBuilder();
                                int validSkillsCount = 0;
                                for (int i = 0; i < itemsList.size(); i++) {
                                    Map<String, String> itemMap = itemsList.get(i);
                                    String skillName = itemMap.getOrDefault("name", "").trim();
                                    if (!skillName.isEmpty()) {
                                        if (validSkillsCount > 0) itemsString.append(", "); // Add comma before adding next skill if not the first valid one
                                        itemsString.append(skillName);
                                        validSkillsCount++;
                                    }
                                }
                                if (itemsString.length() > 0) {
                                    skillLineContent.append("<span class=\"skill-items\">").append(itemsString.toString()).append("</span>");
                                    // hasContentForThisLine = true; // We will check based on final content
                                }
                            } catch (Exception e) {
                                logger.error("Error parsing skills items for category '{}': {}. Expected List<Map<String, String>>.", categoryTitle, e.getMessage());
                                Object rawItems = category.get("items");
                                if (rawItems != null) {
                                    skillLineContent.append("<span class=\"skill-items\">").append(rawItems.toString()).append(" (Parsing Error)</span>");
                                    // hasContentForThisLine = true; // We will check based on final content
                                }
                            }
                        }

                        // Only create the skill-entry div if there is actual renderable text content
                        String finalSkillLineHtml = skillLineContent.toString();
                        String visibleTextInSkillLine = Jsoup.parse(finalSkillLineHtml).text().trim();

                        if (!visibleTextInSkillLine.isEmpty()) {
                            html.append("<div class=\"skill-entry\">");
                            html.append("<div class=\"skill-line-content\">");
                            html.append(finalSkillLineHtml); // Append the original HTML for the skill line
                            html.append("</div>"); // End skill-line-content
                            html.append("</div>"); // End skill-entry
                        }
                    }
                    html.append("</div>"); // End skills-block
                    html.append("</div>"); // End section
                } // End if skills is not empty
            }
            
            // Project Showcases
            if (portfolio.getProjectShowcases() != null) {
                Object[] projects = objectMapper.readValue(
                    portfolio.getProjectShowcases().toString(), 
                    Object[].class
                );

                if (projects != null && projects.length > 0) {
                    html.append("<div class=\"section\">");
                    html.append("<h2 class=\"section-title\">Projects</h2>");
                    
                    for (Object proj : projects) {
                        Map<String, Object> project = objectMapper.convertValue(proj, new TypeReference<Map<String, Object>>() {});
                        
                        html.append("<div class=\"project\">");
                        // Project header for title (and dates, if you add them later)
                        html.append("<div class=\"project-header\">"); 
                        html.append("<span class=\"project-title\">").append(project.getOrDefault("title", "")).append("</span>");
                        // If you add dates to projects, display them here similar to employment/education
                        // String projectStartDate = project.getOrDefault("startDate", "").toString();
                        // String projectEndDate = project.getOrDefault("endDate", "").toString();
                        // if (!projectStartDate.isEmpty() || !projectEndDate.isEmpty()) {
                        //     html.append("<span class=\"project-dates\">").append(projectStartDate).append(" - ").append(projectEndDate).append("</span>");
                        // }
                        html.append("</div>"); // End project-header
                        
                        String projectDescription = project.getOrDefault("description", "").toString().trim();
                        if (!projectDescription.isEmpty()) {
                             // Similar to employment history, try to make bullet points for project description
                             html.append("<div class=\"entry-description\">"); // Re-use entry-description for similar styling
                             if (projectDescription.contains("\n")) { 
                                 html.append("<ul>");
                                 for (String line : projectDescription.split("\n")) {
                                     if (!line.trim().isEmpty()) {
                                         html.append("<li>").append(line.trim().replaceAll("^[-*]\s*", "")).append("</li>");
                                     }
                                 }
                                 html.append("</ul>");
                            } else {
                                 html.append("<p>").append(projectDescription).append("</p>");
                            }
                            html.append("</div>");
                        }
                        
                        if (project.containsKey("technologies")) {
                            Object rawTech = project.get("technologies");
                            String techString = "";
                            if (rawTech instanceof List) {
                                // Assuming List<String> or List<Map<String,String>> with a "name" key
                                List<?> techList = (List<?>) rawTech;
                                StringBuilder techBuilder = new StringBuilder();
                                for (int i = 0; i < techList.size(); i++) {
                                    Object techItem = techList.get(i);
                                    String currentTech = "";
                                    if (techItem instanceof Map) {
                                        Map<String, String> techMap = (Map<String, String>) techItem;
                                        currentTech = techMap.getOrDefault("name", "").trim();
                                    } else {
                                        currentTech = techItem.toString().trim();
                                    }
                                    if (!currentTech.isEmpty()) {
                                        techBuilder.append(currentTech);
                                        if (i < techList.size() - 1) {
                                            // Check next item before adding comma
                                            Object nextTechItem = techList.get(i + 1);
                                            String nextTech = "";
                                            if (nextTechItem instanceof Map) {
                                                Map<String, String> nextTechMap = (Map<String, String>) nextTechItem;
                                                nextTech = nextTechMap.getOrDefault("name", "").trim();
                                            } else {
                                                nextTech = nextTechItem.toString().trim();
                                            }
                                            if(!nextTech.isEmpty()) techBuilder.append(", ");
                                        }
                                    }
                                }
                                techString = techBuilder.toString();
                            } else {
                                techString = rawTech.toString().trim(); // Fallback if not a list
                            }
                            if (!techString.isEmpty()) {
                                html.append("<p class=\"project-tech\"><strong>Technologies:</strong> ").append(techString).append("</p>");
                            }
                        }
                        
                        if (project.containsKey("link") && project.get("link") != null && !project.get("link").toString().isEmpty()) {
                            html.append("<p class=\"project-link\"><strong>Link:</strong> <a href=\"").append(project.get("link")).append("\">").append(project.get("link")).append("</a></p>");
                        }
                        
                        html.append("</div>");
                    }
                    
                    html.append("</div>");
                } // End if projects is not empty
            }
            
            // Footer
            if (includeFooter) {
                html.append("<div class=\"footer\">");
                html.append("<p>Generated by FolioFlow on ").append(java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("MMMM d, yyyy"))).append("</p>");
                html.append("</div>");
            }
            
            html.append("</div>"); // End container
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