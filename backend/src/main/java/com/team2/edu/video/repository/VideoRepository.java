package com.team2.edu.video.repository;

import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.entity.Category;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoRepository extends JpaRepository<Video, Long> {

    @EntityGraph(attributePaths = {"creator", "category", "tag"})
    @Query("""
            select v from Video v
            where v.status = :status and v.creator.deletedAt is null
              and (:categoryId is null or v.category.id = :categoryId)
            """)
    Slice<Video> findPublicVideos(@Param("status") VideoStatus status,
                                 @Param("categoryId") Integer categoryId, Pageable pageable);

    @Query("""
            select distinct v.category from Video v
            where v.status = :status and v.creator.deletedAt is null
            order by v.category.name
            """)
    List<Category> findPublicCategories(@Param("status") VideoStatus status);

    @EntityGraph(attributePaths = {"creator", "category", "tag"})
    @Query("""
            select v from Video v
            where v.creator.email = :email and v.creator.deletedAt is null
              and v.status <> :deleted
            """)
    Slice<Video> findMyVideos(@Param("email") String email, @Param("deleted") VideoStatus deleted,
                             Pageable pageable);

    @EntityGraph(attributePaths = {"creator", "category", "tag"})
    @Query("""
            select v from Video v
            where v.id = :videoId and v.creator.deletedAt is null
              and (v.status = :publicStatus or (v.creator.email = :email and v.status <> :deleted))
            """)
    Optional<Video> findAccessibleVideo(@Param("videoId") Long videoId, @Param("email") String email,
                                       @Param("publicStatus") VideoStatus publicStatus,
                                       @Param("deleted") VideoStatus deleted);

    /** 학습(퀴즈·추천)에 쓸 수 있는 영상: 공개 상태이고 올린 회원이 탈퇴하지 않은 영상 */
    @EntityGraph(attributePaths = {"category", "tag"})
    @Query("""
            select v from Video v
            where v.id = :videoId and v.status = :status and v.creator.deletedAt is null
            """)
    Optional<Video> findPublicVideo(@Param("videoId") Long videoId, @Param("status") VideoStatus status);

    /** 추천 후보: 같은 개념 태그 또는 같은 카테고리, 안 본 영상, 좋아요 순 */
    @Query("""
            select v from Video v
            where v.status = :status and v.creator.deletedAt is null
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
            where v.status = :status and v.creator.deletedAt is null
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
