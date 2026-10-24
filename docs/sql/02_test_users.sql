-- 01_schema.sql 실행 후 테스트 회원 3명 등록 (1회 실행)
-- 테스트 회원 공통 비밀번호: EduTest123!
-- 비밀번호는 BCrypt 해시이며 이메일·닉네임 중복 시 등록에 실패한다.

USE edu_shortform;

INSERT INTO users (email, password, nickname, role)
VALUES
    ('admin@example.com', '$2a$10$.vjlZE9m93yFYJbZiR0hv.luLHTBavQbn9NyWG1STu.K3PTgsGciW', '테스트관리자', 'ADMIN'),
    ('learner@example.com', '$2a$10$.vjlZE9m93yFYJbZiR0hv.luLHTBavQbn9NyWG1STu.K3PTgsGciW', '테스트학습자', 'USER'),
    ('creator@example.com', '$2a$10$.vjlZE9m93yFYJbZiR0hv.luLHTBavQbn9NyWG1STu.K3PTgsGciW', '테스트크리에이터', 'USER');

SELECT user_id, email, nickname, role, created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY user_id;
