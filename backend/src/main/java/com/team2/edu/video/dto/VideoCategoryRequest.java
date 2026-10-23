package com.team2.edu.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VideoCategoryRequest(@NotBlank @Size(max = 30) String name) {
}
