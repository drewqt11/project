package com.apas.website.entities.models.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request payload for changing user password")
public class ChangePasswordRequest {

    @NotBlank(message = "Current password cannot be blank")
    @Schema(description = "User's current password", example = "currentPassword123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String currentPassword;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 8, message = "New password must be at least 8 characters long")
    @Schema(description = "User's new password. Must be at least 8 characters long.", example = "newSecurePassword456", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
} 