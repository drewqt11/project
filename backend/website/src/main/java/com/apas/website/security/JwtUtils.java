package com.apas.website.security;

import com.apas.website.services.AuthService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;

@Component
public class JwtUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    @Value("${jwt.secret:defaultSecretKeyChangeMeInProductionEnvironments!}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours by default
    private int jwtExpirationMs;
    
    @Value("${jwt.refreshExpiration:604800000}") // 7 days by default
    private int refreshTokenExpirationMs;

    private AuthService authService;
    
    // Store the generated key as a static field to avoid regenerating it on each request
    private static SecretKey generatedKey;
    
    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }
    
    private Key getSigningKey() {
        // If we already generated a key, return it
        if (generatedKey != null) {
            return generatedKey;
        }
        
        try {
            // Try to use the configured secret if it's strong enough
            byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            generatedKey = Keys.hmacShaKeyFor(keyBytes);
            return generatedKey;
        } catch (Exception e) {
            logger.warn("Provided JWT secret is not strong enough for HS512. Generating a secure key instead.");
            // Generate a secure key for HS512 as recommended by the error message
            generatedKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            return generatedKey;
        }
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    @SuppressWarnings("unused")
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        String refreshToken = createRefreshToken(claims, userDetails.getUsername());
        
        try {
            String username = userDetails.getUsername();
            
            // Save refresh token to database if authService is available
            if (authService != null) {
                authService.saveRefreshTokenByEmail(username, refreshToken);
            }
        } catch (Exception e) {
            logger.error("Failed to persist refresh token: {}", e.getMessage());
        }
        
        return refreshToken;
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    private String createRefreshToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        
        return false;
    }
} 