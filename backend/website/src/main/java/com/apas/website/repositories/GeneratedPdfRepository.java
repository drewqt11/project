package com.apas.website.repositories;

import com.apas.website.entities.GeneratedPdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GeneratedPdfRepository extends JpaRepository<GeneratedPdf, String> {

    Optional<GeneratedPdf> findByPortfolioPortfolioIdAndFilename(String portfolioId, String filename);
    
    List<GeneratedPdf> findByPortfolioPortfolioIdOrderByGeneratedAtDesc(String portfolioId);

    List<GeneratedPdf> findByUserUserIdOrderByGeneratedAtDesc(String userId);

    // Optional: if you want to retrieve the latest PDF for a portfolio directly
    Optional<GeneratedPdf> findFirstByPortfolioPortfolioIdOrderByGeneratedAtDesc(String portfolioId);
} 