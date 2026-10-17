package com.team2.edu.learning.repository;

import com.team2.edu.learning.entity.WrongNote;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    Optional<WrongNote> findByUserIdAndQuizId(Long userId, Long quizId);
}
