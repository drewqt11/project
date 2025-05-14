package com.apas.website.services;

public interface AuthService {
    
    /**
     * Logs out a user by invalidating all their active refresh tokens
     * 
     * @param userId The ID of the user to log out
     */
    void logout(String userId);
    
    /**
     * Saves a refresh token in the database
     * 
     * @param userId The ID of the user
     * @param token The refresh token to save
     */
    void saveRefreshToken(String userId, String token);
    
    /**
     * Saves a refresh token in the database using the user's email to find the user
     * 
     * @param email The email of the user
     * @param token The refresh token to save
     */
    void saveRefreshTokenByEmail(String email, String token);
} 