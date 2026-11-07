package com.team2.edu.video.repository;

import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.entity.WatchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, UserVideoId> {

    /** 처음 보면 행 추가, 다시 보면 시청 시각만 갱신 (동시 요청에도 행이 하나만 생김) */
    @Modifying
    @Query(value = """
            insert into watch_history (user_id, video_id, watched_at) values (:userId, :videoId, now())
            on duplicate key update watched_at = now()
            """, nativeQuery = true)
    void record(@Param("userId") Long userId, @Param("videoId") Long videoId);

    /** 마이페이지 시청 기록: 공개 영상만, 마지막으로 본 순 */
    @EntityGraph(attributePaths = {"video.creator", "video.category", "video.tag"})
    @Query("""
            select w from WatchHistory w
            where w.user.id = :userId and w.video.status = :status
              and w.video.creator.deletedAt is null
            order by w.watchedAt desc, w.id.videoId desc
            """)
    Slice<WatchHistory> findWatchedVideos(@Param("userId") Long userId,
                                          @Param("status") VideoStatus status,
                                          Pageable pageable);
}
