package com.team2.edu.quiz.entity;

import com.team2.edu.global.BaseTimeEntity;
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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 모든 퀴즈 풀이 기록 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "quiz_attempt")
public class QuizAttempt extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Column(name = "selected_no", nullable = false, columnDefinition = "TINYINT")
    private int selectedNo;

    @Column(name = "is_correct", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean correct;

    public QuizAttempt(User user, Quiz quiz, int selectedNo) {
        this.user = user;
        this.quiz = quiz;
        this.selectedNo = selectedNo;
        this.correct = quiz.isCorrect(selectedNo);
    }
}
