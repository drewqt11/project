package com.apas.website.repositories;

import com.apas.website.entities.PortfolioEntity;
import com.apas.website.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<PortfolioEntity, String> {
    List<PortfolioEntity> findByUser(UserEntity user);
    List<PortfolioEntity> findByUserUserId(String userId);
    Optional<PortfolioEntity> findByPortfolioIdAndUserUserId(String portfolioId, String userId);
    Optional<PortfolioEntity> findByPortfolioId(String portfolioId);
} 