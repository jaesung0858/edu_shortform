package com.team2.edu.user.controller;

import com.team2.edu.user.dto.MyInfoResponse;
import com.team2.edu.user.dto.NicknameUpdateRequest;
import com.team2.edu.user.dto.PasswordChangeRequest;
import com.team2.edu.user.dto.WithdrawRequest;
import com.team2.edu.user.service.UserAccountService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserAccountController {

    private final UserAccountService accountService;

    public UserAccountController(UserAccountService accountService) {
        this.accountService = accountService;
    }

    @Operation(summary = "내 닉네임 수정", description = "로그인한 회원의 닉네임을 바꿉니다. 이미 쓰는 닉네임이면 409입니다.")
    @PatchMapping("/api/users/me")
    public MyInfoResponse updateNickname(@Valid @RequestBody NicknameUpdateRequest request,
                                         Authentication authentication) {
        return accountService.updateNickname(authentication.getName(), request);
    }

    @Operation(summary = "내 비밀번호 변경", description = "현재 비밀번호가 맞아야 바뀝니다. 로그인은 유지됩니다.")
    @PatchMapping("/api/users/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody PasswordChangeRequest request, Authentication authentication) {
        accountService.changePassword(authentication.getName(), request);
    }

    @Operation(summary = "회원 탈퇴", description = "비밀번호를 확인한 뒤 탈퇴 처리하고 로그아웃합니다. 관리자 계정은 탈퇴할 수 없습니다.")
    @DeleteMapping("/api/users/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@Valid @RequestBody WithdrawRequest request, Authentication authentication,
                         HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        accountService.withdraw(authentication.getName(), request);
        // 탈퇴가 커밋된 뒤 세션을 끊는다
        new SecurityContextLogoutHandler().logout(httpRequest, httpResponse, authentication);
    }
}
