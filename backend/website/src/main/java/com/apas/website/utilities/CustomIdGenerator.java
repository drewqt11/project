package com.apas.website.utilities;

import java.security.SecureRandom;

/**
 * Utility class for generating custom formatted IDs.
 */
public class CustomIdGenerator {
    
    private static final String USER_PREFIX = "USER";
    private static final String PORTFOLIO_PREFIX = "PORT";
    private static final int FIRST_SECTION_LENGTH = 4;
    private static final int SECOND_SECTION_LENGTH = 4;
    private static final String SECTION_SEPARATOR = "-";
    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * Generates a user ID in the format "USER-XXXX-XXXX" 
     * where X is a random alphanumeric character (0-9, A-Z).
     * 
     * @return A formatted user ID string
     */
    public static String generateUserId() {
        StringBuilder sb = new StringBuilder();
        sb.append(USER_PREFIX).append(SECTION_SEPARATOR);
        sb.append(generateRandomString(FIRST_SECTION_LENGTH)).append(SECTION_SEPARATOR);
        sb.append(generateRandomString(SECOND_SECTION_LENGTH));
        
        return sb.toString();
    }
    
    /**
     * Generates a portfolio ID in the format "PORT-XXXX-XXXX" 
     * where X is a random alphanumeric character (0-9, A-Z).
     * 
     * @return A formatted portfolio ID string
     */
    public static String generatePortfolioId() {
        StringBuilder sb = new StringBuilder();
        sb.append(PORTFOLIO_PREFIX).append(SECTION_SEPARATOR);
        sb.append(generateRandomString(FIRST_SECTION_LENGTH)).append(SECTION_SEPARATOR);
        sb.append(generateRandomString(SECOND_SECTION_LENGTH));
        
        return sb.toString();
    }
    
    /**
     * Generates a random string of specified length using characters from CHARS.
     * 
     * @param length The length of the random string to generate
     * @return A random string
     */
    private static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
    
    /**
     * Validates if the given string matches the user ID format.
     * 
     * @param id The ID to validate
     * @return true if the ID matches the format, false otherwise
     */
    public static boolean isValidUserIdFormat(String id) {
        if (id == null || id.length() != USER_PREFIX.length() + 2 * SECTION_SEPARATOR.length() + 
                FIRST_SECTION_LENGTH + SECOND_SECTION_LENGTH) {
            return false;
        }
        
        String[] parts = id.split(SECTION_SEPARATOR);
        return parts.length == 3 && 
               parts[0].equals(USER_PREFIX) && 
               parts[1].length() == FIRST_SECTION_LENGTH && 
               parts[2].length() == SECOND_SECTION_LENGTH;
    }
    
    /**
     * Validates if the given string matches the portfolio ID format.
     * 
     * @param id The ID to validate
     * @return true if the ID matches the format, false otherwise
     */
    public static boolean isValidPortfolioIdFormat(String id) {
        if (id == null || id.length() != PORTFOLIO_PREFIX.length() + 2 * SECTION_SEPARATOR.length() + 
                FIRST_SECTION_LENGTH + SECOND_SECTION_LENGTH) {
            return false;
        }
        
        String[] parts = id.split(SECTION_SEPARATOR);
        return parts.length == 3 && 
               parts[0].equals(PORTFOLIO_PREFIX) && 
               parts[1].length() == FIRST_SECTION_LENGTH && 
               parts[2].length() == SECOND_SECTION_LENGTH;
    }
} 