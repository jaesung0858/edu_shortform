package com.team2.edu.video.repository;

import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.WatchHistory;
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
}
