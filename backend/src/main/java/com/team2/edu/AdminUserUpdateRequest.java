package com.team2.edu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(@NotBlank @Size(max = 30) String nickname) {
}
