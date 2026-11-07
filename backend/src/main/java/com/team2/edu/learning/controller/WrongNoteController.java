package com.team2.edu.learning.controller;

import com.team2.edu.learning.dto.WrongNoteListResponse;
import com.team2.edu.learning.service.WrongNoteService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WrongNoteController {

    private final WrongNoteService wrongNoteService;

    public WrongNoteController(WrongNoteService wrongNoteService) {
        this.wrongNoteService = wrongNoteService;
    }

    @Operation(summary = "내 오답 노트", description = "로그인한 회원이 틀린 공개 영상의 문항을 마지막으로 틀린 순으로 12개씩 조회합니다.")
    @GetMapping("/api/users/me/wrong-notes")
    public WrongNoteListResponse wrongNotes(@RequestParam(defaultValue = "0") @Min(0) int page,
                                            Authentication authentication) {
        return wrongNoteService.findMine(authentication.getName(), page);
    }
}
