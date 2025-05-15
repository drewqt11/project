package com.apas.website.configurations;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("APAS Website API")
                        .description("API Documentation for APAS Website")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("APAS Support")
                                .email("support@apas.example.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .tags(List.of(
                        new Tag().name("Authentication").description("Authentication management APIs"),
                        new Tag().name("Portfolio Management").description("APIs for managing user portfolios")
                ));
    }
    
    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("authentication")
                .pathsToMatch("/api/auth/**")
                .build();
    }
    
    @Bean
    public GroupedOpenApi portfolioApi() {
        return GroupedOpenApi.builder()
                .group("portfolios")
                .displayName("Portfolio Management APIs")
                .pathsToMatch("/api/users/{userId}/portfolios", "/api/users/{userId}/portfolios/**", 
                              "/api/portfolios/**", "/api/portfolios/{portfolioId}")
                .build();
    }
    
    @Bean
    public GroupedOpenApi allApis() {
        return GroupedOpenApi.builder()
                .group("all-apis")
                .displayName("All APIs")
                .pathsToMatch("/api/**")
                .build();
    }
} 