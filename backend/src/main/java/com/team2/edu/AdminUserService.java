package com.team2.edu;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AdminUserService {

    private final JdbcTemplate jdbcTemplate;

    public AdminUserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 삭제되지 않은 회원을 이메일이나 닉네임으로 검색한다.
    public List<AdminUserResponse> findAll(String keyword) {
        String sql = """
                SELECT user_id, email, nickname, role, created_at
                FROM users
                WHERE deleted_at IS NULL
                  AND (email LIKE ? OR nickname LIKE ?)
                ORDER BY user_id
                """;

        String searchKeyword = "%" + keyword.trim() + "%";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                        new AdminUserResponse(
                                rs.getLong("user_id"),
                                rs.getString("email"),
                                rs.getString("nickname"),
                                rs.getString("role"),
                                rs.getObject("created_at", LocalDateTime.class)
                        ),
                searchKeyword,
                searchKeyword
        );
    }
}
