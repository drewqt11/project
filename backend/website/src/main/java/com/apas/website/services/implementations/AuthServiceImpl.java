package com.apas.website.services.implementations;

import com.apas.website.entities.RefreshToken;
import com.apas.website.entities.UserEntity;
import com.apas.website.repositories.RefreshTokenRepository;
import com.apas.website.repositories.UserRepository;
import com.apas.website.services.AuthService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${jwt.refreshExpiration:604800000}") // 7 days by default
    private int refreshTokenExpirationMs;

    @Autowired
    public AuthServiceImpl(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void logout(String userId) {
        logger.info("Logging out user with ID: {}", userId);
        refreshTokenRepository.revokeAllUserTokens(userId);
    }

    @Override
    @Transactional
    public void saveRefreshToken(String userId, String token) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        createAndSaveRefreshToken(user, token);
    }
    
    @Override
    @Transactional
    public void saveRefreshTokenByEmail(String email, String token) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        createAndSaveRefreshToken(user, token);
    }
    
    private void createAndSaveRefreshToken(UserEntity user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));
        
        refreshTokenRepository.save(refreshToken);
        logger.info("Saved refresh token for user: {}", user.getUserId());
    }

    @Override
    @Transactional
    public void changePassword(String userId, String currentPassword, String newPassword) {
        logger.info("Attempting to change password for user ID: {}", userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {} during password change attempt", userId);
                    return new RuntimeException("User not found with ID: " + userId);
                });

        if (user.getIsOAuth2User()) {
            logger.warn("Attempt to change password for OAuth2 user ID: {}", userId);
            throw new RuntimeException("Password cannot be changed for users logged in via OAuth2.");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            logger.warn("Current password mismatch for user ID: {}", userId);
            throw new RuntimeException("Incorrect current password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password changed successfully for user ID: {}", userId);
    }
} 