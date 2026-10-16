-- 교육용 숏폼 플랫폼: MySQL 8.0.16 이상용 초기 스키마
-- 기준: 2조 DB 명세서 및 이후 개발 범위 조정
-- 변경: 회원 삭제 표시(users.deleted_at) 추가, 1·3·7일 복습 예약 컬럼 제외
-- 신규 DB 초기화용이며 기존 테이블의 구조를 변경하는 스크립트가 아니다.

CREATE DATABASE IF NOT EXISTS edu_shortform
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE edu_shortform;

CREATE TABLE users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt 비밀번호 해시',
    nickname VARCHAR(30) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'USER' COMMENT 'USER: 시청·영상 등록, ADMIN: 관리자',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL COMMENT 'NULL: 일반 회원, 값 있음: 삭제된 회원',
    PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_nickname UNIQUE (nickname),
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'))
) ENGINE = InnoDB;

CREATE TABLE category (
    category_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (category_id),
    CONSTRAINT uq_category_name UNIQUE (name)
) ENGINE = InnoDB;

CREATE TABLE concept_tag (
    tag_id INT NOT NULL AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (tag_id),
    CONSTRAINT uq_concept_tag_category_name UNIQUE (category_id, name),
    CONSTRAINT fk_concept_tag_category FOREIGN KEY (category_id)
        REFERENCES category (category_id) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE video (
    video_id BIGINT NOT NULL AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    tag_id INT NOT NULL COMMENT '영상당 개념 태그 1개',
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NULL DEFAULT NULL,
    video_key VARCHAR(255) NOT NULL COMMENT '외부 저장소의 영상 파일 경로 또는 식별자',
    thumbnail_key VARCHAR(255) NULL DEFAULT NULL,
    duration_sec INT NOT NULL,
    view_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'PUBLIC' COMMENT 'PUBLIC: 공개, HIDDEN: 숨김, DELETED: 삭제',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (video_id),
    CONSTRAINT fk_video_creator FOREIGN KEY (creator_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_video_category FOREIGN KEY (category_id)
        REFERENCES category (category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_video_tag FOREIGN KEY (tag_id)
        REFERENCES concept_tag (tag_id) ON DELETE RESTRICT,
    CONSTRAINT chk_video_duration CHECK (duration_sec > 0),
    CONSTRAINT chk_video_view_count CHECK (view_count >= 0),
    CONSTRAINT chk_video_like_count CHECK (like_count >= 0),
    CONSTRAINT chk_video_status CHECK (status IN ('PUBLIC', 'HIDDEN', 'DELETED'))
) ENGINE = InnoDB;

CREATE TABLE video_like (
    user_id BIGINT NOT NULL,
    video_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id),
    CONSTRAINT fk_video_like_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_video_like_video FOREIGN KEY (video_id)
        REFERENCES video (video_id) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE watch_history (
    user_id BIGINT NOT NULL,
    video_id BIGINT NOT NULL,
    watched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id),
    CONSTRAINT fk_watch_history_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_watch_history_video FOREIGN KEY (video_id)
        REFERENCES video (video_id) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE quiz (
    quiz_id BIGINT NOT NULL AUTO_INCREMENT,
    video_id BIGINT NOT NULL,
    tag_id INT NOT NULL,
    question VARCHAR(500) NOT NULL,
    option1 VARCHAR(200) NOT NULL,
    option2 VARCHAR(200) NOT NULL,
    option3 VARCHAR(200) NOT NULL,
    option4 VARCHAR(200) NOT NULL,
    answer_no TINYINT NOT NULL COMMENT '정답 보기 번호: 1~4',
    explanation VARCHAR(1000) NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (quiz_id),
    CONSTRAINT fk_quiz_video FOREIGN KEY (video_id)
        REFERENCES video (video_id) ON DELETE RESTRICT,
    CONSTRAINT fk_quiz_tag FOREIGN KEY (tag_id)
        REFERENCES concept_tag (tag_id) ON DELETE RESTRICT,
    CONSTRAINT chk_quiz_answer_no CHECK (answer_no BETWEEN 1 AND 4)
) ENGINE = InnoDB;

CREATE TABLE quiz_attempt (
    attempt_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    selected_no TINYINT NOT NULL COMMENT '선택한 보기 번호: 1~4',
    is_correct TINYINT(1) NOT NULL COMMENT '0: 오답, 1: 정답',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attempt_id),
    CONSTRAINT fk_quiz_attempt_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_quiz_attempt_quiz FOREIGN KEY (quiz_id)
        REFERENCES quiz (quiz_id) ON DELETE RESTRICT,
    CONSTRAINT chk_quiz_attempt_selected_no CHECK (selected_no BETWEEN 1 AND 4),
    CONSTRAINT chk_quiz_attempt_is_correct CHECK (is_correct IN (0, 1))
) ENGINE = InnoDB;

CREATE TABLE wrong_note (
    note_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '처음 틀린 시각',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id),
    CONSTRAINT uq_wrong_note_user_quiz UNIQUE (user_id, quiz_id),
    CONSTRAINT fk_wrong_note_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_wrong_note_quiz FOREIGN KEY (quiz_id)
        REFERENCES quiz (quiz_id) ON DELETE RESTRICT
) ENGINE = InnoDB;
