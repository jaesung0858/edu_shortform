package com.team2.edu.learning.repository;

import com.team2.edu.learning.entity.WrongNote;
import com.team2.edu.video.entity.VideoStatus;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    Optional<WrongNote> findByUserIdAndQuizId(Long userId, Long quizId);

    /** 마이페이지 오답 노트: 공개 영상의 문항만, 마지막으로 틀린 순 */
    @EntityGraph(attributePaths = {"quiz.video", "quiz.tag"})
    @Query("""
            select n from WrongNote n
            where n.user.id = :userId and n.quiz.video.status = :status
              and n.quiz.video.creator.deletedAt is null
            order by n.updatedAt desc, n.id desc
            """)
    Slice<WrongNote> findNotes(@Param("userId") Long userId, @Param("status") VideoStatus status,
                               Pageable pageable);
}
