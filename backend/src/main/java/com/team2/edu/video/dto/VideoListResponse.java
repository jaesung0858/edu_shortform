package com.team2.edu.video.dto;

import java.time.LocalDateTime;
import java.util.List;

public record VideoListResponse(List<Item> videos, List<CategoryOption> categories, boolean hasNext) {

    public record Item(Long videoId, String title, String creatorNickname,
                       Integer categoryId, String categoryName, String tagName,
                       int viewCount, int likeCount, int durationSec, LocalDateTime createdAt, String status,
                       String thumbnailUrl) {
    }

    public record CategoryOption(Integer categoryId, String name) {
    }
}
