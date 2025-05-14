package com.apas.website.security;

import com.apas.website.entities.UserEntity;
import com.apas.website.repositories.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.oauth2.redirectUri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @SuppressWarnings("unused")
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String userId = oAuth2User.getAttribute("id");
        
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            
            // Create UserDetails object for JWT generation
            org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getEmail(), 
                    user.getPassword() != null ? user.getPassword() : "", 
                    true, true, true, true, 
                    authentication.getAuthorities()
                );
            
            // Generate JWT tokens
            String accessToken = jwtUtils.generateToken(userDetails);
            String refreshToken = jwtUtils.generateRefreshToken(userDetails);
            
            // Build redirect URL with tokens
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("id", user.getUserId())
                    .queryParam("email", user.getEmail())
                    .queryParam("firstName", user.getFirstName())
                    .queryParam("lastName", user.getLastName())
                    .build().toUriString();
            
            // Perform redirect to frontend with tokens
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Handle error case - user not found
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", "User not found")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
} 