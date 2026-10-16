-- 로컬 개발용 테스트 회원 3명. 01_schema.sql 실행 후 한 번만 실행한다.
-- 테스트 회원 공통 비밀번호: EduTest123!
-- password에는 Spring Security BCryptPasswordEncoder로 생성·검증한 해시를 저장한다.
-- 기존 회원을 수정하거나 덮어쓰지 않으며, 같은 이메일·닉네임이 있으면 INSERT가 실패한다.

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
