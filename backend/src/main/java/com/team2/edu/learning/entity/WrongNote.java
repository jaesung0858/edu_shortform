package com.team2.edu.learning.entity;

import com.team2.edu.global.BaseTimeEntity;
import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 오답 노트: 회원이 틀린 문항. 회원·문항 조합마다 한 줄 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "wrong_note",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quiz_id"}))
public class WrongNote extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    /** 마지막으로 틀린 시각 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WrongNote(User user, Quiz quiz) {
        this.user = user;
        this.quiz = quiz;
    }

    /** 같은 문항을 또 틀렸을 때 */
    public void wrongAgain() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        updatedAt = getCreatedAt();
    }
}
