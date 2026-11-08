package com.team2.edu.quiz.repository;

import com.team2.edu.quiz.entity.QuizAttempt;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    /** 문항별로 틀린 횟수 */
    @Query("""
            select a.quiz.id as quizId, count(a) as wrongCount from QuizAttempt a
            where a.user.id = :userId and a.correct = false and a.quiz.id in :quizIds
            group by a.quiz.id
            """)
    List<WrongCount> countWrong(@Param("userId") Long userId, @Param("quizIds") Collection<Long> quizIds);

    interface WrongCount {
        Long getQuizId();
        long getWrongCount();
    }
}
