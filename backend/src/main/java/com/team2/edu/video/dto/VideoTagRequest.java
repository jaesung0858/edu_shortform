package com.team2.edu.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VideoTagRequest(@NotBlank @Size(max = 50) String name) {
}
