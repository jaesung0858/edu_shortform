package com.team2.edu.quiz.repository;

import com.team2.edu.quiz.entity.Quiz;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByVideoIdOrderByIdAsc(Long videoId);
}
