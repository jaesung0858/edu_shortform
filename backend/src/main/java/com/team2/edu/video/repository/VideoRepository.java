package com.team2.edu.video.repository;

import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoRepository extends JpaRepository<Video, Long> {

    /** 추천 후보: 같은 개념 태그 또는 같은 카테고리, 안 본 영상, 좋아요 순 */
    @Query("""
            select v from Video v
            where v.status = :status
              and v.id <> :videoId
              and (v.tag.id = :tagId or v.category.id = :categoryId)
              and not exists (
                  select 1 from WatchHistory w
                  where w.user.id = :userId and w.video.id = v.id)
            order by v.likeCount desc, v.id desc
            """)
    List<Video> findRecommendCandidates(@Param("userId") Long userId,
                                        @Param("videoId") Long videoId,
                                        @Param("tagId") Integer tagId,
                                        @Param("categoryId") Integer categoryId,
                                        @Param("status") VideoStatus status,
                                        Pageable pageable);

    /** 후보가 모자랄 때 채우는 인기 영상 */
    @Query("""
            select v from Video v
            where v.status = :status
              and v.id not in :excludeIds
              and not exists (
                  select 1 from WatchHistory w
                  where w.user.id = :userId and w.video.id = v.id)
            order by v.likeCount desc, v.id desc
            """)
    List<Video> findPopular(@Param("userId") Long userId,
                            @Param("excludeIds") Collection<Long> excludeIds,
                            @Param("status") VideoStatus status,
                            Pageable pageable);
}
