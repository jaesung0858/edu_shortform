package com.team2.edu.video.repository;

import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.VideoLike;
import com.team2.edu.video.entity.VideoStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoLikeRepository extends JpaRepository<VideoLike, UserVideoId> {

    @EntityGraph(attributePaths = {"video.creator", "video.category", "video.tag"})
    @Query("""
            select l from VideoLike l
            where l.user.id = :userId and l.video.status = :status
              and l.video.creator.deletedAt is null
            order by l.createdAt desc, l.id.videoId desc
            """)
    Slice<VideoLike> findLikedVideos(@Param("userId") Long userId,
                                     @Param("status") VideoStatus status,
                                     Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from VideoLike l where l.id = :id")
    Optional<VideoLike> findForUpdate(@Param("id") UserVideoId id);
}
