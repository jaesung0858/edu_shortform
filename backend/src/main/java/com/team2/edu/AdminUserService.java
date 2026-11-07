package com.team2.edu;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private static final RowMapper<AdminUserResponse> MEMBER = (rs, rowNum) -> new AdminUserResponse(
            rs.getLong("user_id"), rs.getString("email"), rs.getString("nickname"), rs.getString("role"),
            rs.getObject("created_at", LocalDateTime.class));

    private final JdbcTemplate jdbcTemplate;

    public AdminUserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminUserResponse> findAll(String keyword) {
        String sql = """
                SELECT user_id, email, nickname, role, created_at
                FROM users
                WHERE deleted_at IS NULL
                  AND (email LIKE ? OR nickname LIKE ?)
                ORDER BY user_id
                """;
        String searchKeyword = "%" + keyword.trim() + "%";
        return jdbcTemplate.query(sql, MEMBER, searchKeyword, searchKeyword);
    }

    public AdminUserResponse findOne(Long userId) {
        return findActive(userId, false);
    }

    @Transactional
    public AdminUserResponse updateNickname(Long userId, String nickname) {
        var member = findActive(userId, true);
        String name = nickname.strip();
        try {
            jdbcTemplate.update("UPDATE users SET nickname = ? WHERE user_id = ?", name, userId);
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }
        return new AdminUserResponse(userId, member.email(), name, member.role(), member.createdAt());
    }

    @Transactional
    public void delete(Long userId) {
        if ("ADMIN".equals(findActive(userId, true).role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 계정은 삭제할 수 없습니다.");
        }
        jdbcTemplate.update("UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ?", userId);
    }

    private AdminUserResponse findActive(Long userId, boolean lock) {
        String sql = "SELECT user_id, email, nickname, role, created_at FROM users WHERE user_id = ? AND deleted_at IS NULL";
        if (lock) sql += " FOR UPDATE";
        return jdbcTemplate.query(sql, MEMBER, userId).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }
}
