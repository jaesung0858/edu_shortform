package com.team2.edu;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // 회원 목록 조회·검색
    @GetMapping
    public List<AdminUserResponse> getUsers(
            @RequestParam(name = "keyword", defaultValue = "") String keyword) {
        return adminUserService.findAll(keyword);
    }
}
