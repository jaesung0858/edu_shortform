package com.team2.edu;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @Operation(summary = "관리자 회원 목록·검색")
    @GetMapping
    public List<AdminUserResponse> getUsers(@RequestParam(name = "keyword", defaultValue = "") String keyword) {
        return adminUserService.findAll(keyword);
    }

    @Operation(summary = "관리자 회원 상세 조회")
    @GetMapping("/{userId}")
    public AdminUserResponse getUser(@PathVariable @Positive Long userId) {
        return adminUserService.findOne(userId);
    }

    @Operation(summary = "관리자 회원 닉네임 수정")
    @PatchMapping("/{userId}")
    public AdminUserResponse update(@PathVariable @Positive Long userId, @Valid @RequestBody AdminUserUpdateRequest request) {
        return adminUserService.updateNickname(userId, request.nickname());
    }

    @Operation(summary = "관리자 회원 삭제", description = "일반 회원의 삭제 시각을 기록합니다. 관리자 계정은 삭제할 수 없습니다.")
    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive Long userId) {
        adminUserService.delete(userId);
    }
}
