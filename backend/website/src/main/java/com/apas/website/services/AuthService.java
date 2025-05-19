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

    /**
     * Changes the password for the given user.
     *
     * @param userId The ID of the user whose password is to be changed.
     * @param currentPassword The user's current password.
     * @param newPassword The new password to set.
     * @throws RuntimeException if the current password does not match or user not found.
     */
    void changePassword(String userId, String currentPassword, String newPassword);
} 