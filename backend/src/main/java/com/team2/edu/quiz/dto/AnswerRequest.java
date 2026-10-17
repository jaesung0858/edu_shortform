package com.team2.edu.quiz.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AnswerRequest(@NotNull @Min(1) @Max(4) Integer selectedNo) {
}
