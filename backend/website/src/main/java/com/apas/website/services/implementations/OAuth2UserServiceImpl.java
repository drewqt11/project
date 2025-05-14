package com.apas.website.services.implementations;

import com.apas.website.entities.UserEntity;
import com.apas.website.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;
    
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }
    
    /**
     * Generates a secure random password
     * @return A random password string
     */
    @SuppressWarnings("unused")
    private String generateSecurePassword() {
        // Use UUID as base for randomness
        String uuid = UUID.randomUUID().toString().replace("-", "");
        
        // Add some additional randomness with special characters
        StringBuilder password = new StringBuilder(20);
        for (int i = 0; i < 20; i++) {
            password.append(CHARS.charAt(SECURE_RANDOM.nextInt(CHARS.length())));
        }
        
        return password.toString();
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        // Google specific attributes
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        logger.info("Processing OAuth2 user: email={}, name={}", email, name);
        
        if (!StringUtils.hasText(email)) {
            logger.error("Email not found from OAuth2 provider");
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }
        
        // Split name into first and last name (simplistic approach)
        String firstName = name;
        String lastName = "";
        if (name != null && name.contains(" ")) {
            String[] nameParts = name.split(" ", 2);
            firstName = nameParts[0];
            lastName = nameParts[1];
        } else {
            // If there's no space in the name, use the entire name as firstName
            // and leave lastName empty for OAuth2 users
            firstName = name != null ? name : "User";
            // lastName will remain empty string
        }
        
        logger.info("Parsed name: firstName={}, lastName={}", firstName, lastName);
        
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        UserEntity user;
        
        if (userOptional.isPresent()) {
            logger.info("Found existing user with email: {}", email);
            user = userOptional.get();
            
            // For users previously created through regular registration (not OAuth2),
            // we need to mark them as OAuth2 users now
            if (!Boolean.TRUE.equals(user.getIsOAuth2User())) {
                user.setIsOAuth2User(true);
            }
            
            // Update existing user information if needed
            boolean needsUpdate = false;
            
            if (!firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                needsUpdate = true;
            }
            
            // Only update lastName if it's not empty
            if (StringUtils.hasText(lastName) && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                logger.info("Updating user information: firstName={}, lastName={}", firstName, lastName);
                try {
                    userRepository.save(user);
                } catch (Exception e) {
                    logger.error("Error updating existing user: {}", e.getMessage(), e);
                    throw new InternalAuthenticationServiceException("Error updating user: " + e.getMessage(), e);
                }
            }
        } else {
            logger.info("Creating new user from OAuth2: email={}, firstName={}, lastName={}", 
                    email, firstName, lastName);
            // Create a new user
            user = new UserEntity();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setIsOAuth2User(true);
            
            // Generate and set a secure random password
            String secureRandomPassword = generateSecurePassword();
            user.setPassword(passwordEncoder.encode(secureRandomPassword));
            
            try {
                userRepository.save(user);
            } catch (Exception e) {
                logger.error("Error creating new OAuth2 user: {}", e.getMessage(), e);
                throw new InternalAuthenticationServiceException("Error creating user: " + e.getMessage(), e);
            }
        }
        
        // Create custom OAuth2User with user ID as name attribute key
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("id", user.getUserId());
        
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
    }
} 