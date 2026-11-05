package com.team2.edu.video.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminVideoUpdateRequest(
        @Size(max = 100) String title,
        @Size(max = 1000) String description,
        @Schema(allowableValues = {"PUBLIC", "HIDDEN"}) @Pattern(regexp = "PUBLIC|HIDDEN") String status) {
}
