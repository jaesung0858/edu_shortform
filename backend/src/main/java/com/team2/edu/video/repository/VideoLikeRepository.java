package com.team2.edu.video.repository;

import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.VideoLike;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoLikeRepository extends JpaRepository<VideoLike, UserVideoId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from VideoLike l where l.id = :id")
    Optional<VideoLike> findForUpdate(@Param("id") UserVideoId id);
}
