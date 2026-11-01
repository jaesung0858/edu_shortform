package com.team2.edu.recommend.dto;

import com.team2.edu.video.entity.Video;
import org.springframework.util.StringUtils;

/** 추천 카드(U-05) 한 장 */
public record RecommendResponse(
        Long videoId,
        String title,
        String thumbnailUrl,
        int likeCount,
        String reason
) {

    public static RecommendResponse of(Video video, String reason) {
        // 영상 API와 같은 규칙: 썸네일이 있으면 바로 쓸 수 있는 주소, 없으면 null
        String thumbnailUrl = StringUtils.hasText(video.getThumbnailKey())
                ? "/api/videos/" + video.getId() + "/thumbnail" : null;
        return new RecommendResponse(video.getId(), video.getTitle(), thumbnailUrl,
                video.getLikeCount(), reason);
    }
}
