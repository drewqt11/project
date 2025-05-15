package com.apas.website.services.implementations;

import com.apas.website.entities.PortfolioEntity;
import com.apas.website.entities.UserEntity;
import com.apas.website.entities.models.request.CreatePortfolioRequest;
import com.apas.website.entities.models.request.UpdatePortfolioRequest;
import com.apas.website.entities.models.response.PortfolioResponse;
import com.apas.website.entities.models.response.PortfolioSummaryResponse;
import com.apas.website.repositories.PortfolioRepository;
import com.apas.website.repositories.UserRepository;
import com.apas.website.services.PortfolioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioServiceImpl implements PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioServiceImpl.class);
    
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public PortfolioServiceImpl(PortfolioRepository portfolioRepository, UserRepository userRepository, ObjectMapper objectMapper) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public PortfolioResponse createPortfolio(String userId, CreatePortfolioRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        PortfolioEntity portfolio = new PortfolioEntity();
        portfolio.setTitle(request.getTitle());
        portfolio.setUser(user);
        
        PortfolioEntity savedPortfolio = portfolioRepository.save(portfolio);
        logger.info("Created portfolio with ID: {} for user: {}", savedPortfolio.getPortfolioId(), userId);
        
        return convertToPortfolioResponse(savedPortfolio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PortfolioSummaryResponse> getAllPortfoliosByUserId(String userId) {
        List<PortfolioEntity> portfolios = portfolioRepository.findByUserUserId(userId);
        logger.info("Retrieved {} portfolios for user: {}", portfolios.size(), userId);
        
        return portfolios.stream()
                .map(this::convertToPortfolioSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioById(String portfolioId) {
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
        
        logger.info("Retrieved portfolio with ID: {}", portfolioId);
        return convertToPortfolioResponse(portfolio);
    }

    @Override
    @Transactional
    public PortfolioResponse updatePortfolio(String portfolioId, UpdatePortfolioRequest request) {
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
        
        // Update fields if provided
        if (request.getTitle() != null) {
            portfolio.setTitle(request.getTitle());
        }
        
        try {
            // Convert and set JSON fields if provided
            if (request.getPersonalInformation() != null) {
                portfolio.setPersonalInformation(objectMapper.writeValueAsString(request.getPersonalInformation()));
            }
            
            if (request.getEmploymentHistory() != null) {
                portfolio.setEmploymentHistory(objectMapper.writeValueAsString(request.getEmploymentHistory()));
            }
            
            if (request.getEducationalBackground() != null) {
                portfolio.setEducationalBackground(objectMapper.writeValueAsString(request.getEducationalBackground()));
            }
            
            if (request.getSkills() != null) {
                portfolio.setSkills(objectMapper.writeValueAsString(request.getSkills()));
            }
            
            if (request.getProjectShowcases() != null) {
                portfolio.setProjectShowcases(objectMapper.writeValueAsString(request.getProjectShowcases()));
            }
        } catch (Exception e) {
            logger.error("Error converting portfolio data to JSON", e);
            throw new RuntimeException("Error updating portfolio: " + e.getMessage());
        }
        
        PortfolioEntity updatedPortfolio = portfolioRepository.save(portfolio);
        logger.info("Updated portfolio with ID: {}", portfolioId);
        
        return convertToPortfolioResponse(updatedPortfolio);
    }

    @Override
    @Transactional
    public boolean deletePortfolio(String portfolioId) {
        PortfolioEntity portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
        
        portfolioRepository.delete(portfolio);
        logger.info("Deleted portfolio with ID: {}", portfolioId);
        
        return true;
    }
    
    private PortfolioResponse convertToPortfolioResponse(PortfolioEntity portfolio) {
        PortfolioResponse response = new PortfolioResponse();
        response.setPortfolioId(portfolio.getPortfolioId());
        response.setTitle(portfolio.getTitle());
        response.setUserId(portfolio.getUser().getUserId());
        response.setCreatedAt(portfolio.getCreatedAt());
        response.setUpdatedAt(portfolio.getUpdatedAt());
        
        try {
            // Convert JSON strings to objects if they exist
            if (portfolio.getPersonalInformation() != null) {
                response.setPersonalInformation(objectMapper.readValue(portfolio.getPersonalInformation(), Object.class));
            }
            
            if (portfolio.getEmploymentHistory() != null) {
                response.setEmploymentHistory(objectMapper.readValue(portfolio.getEmploymentHistory(), Object.class));
            }
            
            if (portfolio.getEducationalBackground() != null) {
                response.setEducationalBackground(objectMapper.readValue(portfolio.getEducationalBackground(), Object.class));
            }
            
            if (portfolio.getSkills() != null) {
                response.setSkills(objectMapper.readValue(portfolio.getSkills(), Object.class));
            }
            
            if (portfolio.getProjectShowcases() != null) {
                response.setProjectShowcases(objectMapper.readValue(portfolio.getProjectShowcases(), Object.class));
            }
        } catch (Exception e) {
            logger.error("Error converting JSON to objects", e);
        }
        
        return response;
    }
    
    private PortfolioSummaryResponse convertToPortfolioSummaryResponse(PortfolioEntity portfolio) {
        return new PortfolioSummaryResponse(
                portfolio.getPortfolioId(),
                portfolio.getTitle(),
                portfolio.getCreatedAt(),
                portfolio.getUpdatedAt()
        );
    }
} 