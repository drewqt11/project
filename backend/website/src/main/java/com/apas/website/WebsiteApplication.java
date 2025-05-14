package com.apas.website;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class WebsiteApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebsiteApplication.class, args);
	}

	/**
	 * After running the application with ddl-auto=create once,
	 * change it back to 'update' in application.properties
	 */
	@Bean
	public CommandLineRunner initialSetupComplete() {
		return args -> {
			System.out.println("Database schema recreated successfully.");
			System.out.println("IMPORTANT: Change spring.jpa.hibernate.ddl-auto back to 'update' in application.properties after this run.");
		};
	}

}
