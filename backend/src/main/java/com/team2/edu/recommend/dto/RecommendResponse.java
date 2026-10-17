package com.team2.edu.recommend.dto;

import com.team2.edu.video.entity.Video;

/** 추천 카드(U-05) 한 장 */
public record RecommendResponse(
        Long videoId,
        String title,
        String thumbnailKey,
        int likeCount,
        String reason
) {

    public static RecommendResponse of(Video video, String reason) {
        return new RecommendResponse(video.getId(), video.getTitle(), video.getThumbnailKey(),
                video.getLikeCount(), reason);
    }
}
