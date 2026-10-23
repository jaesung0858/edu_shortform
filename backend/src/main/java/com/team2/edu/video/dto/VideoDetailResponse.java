package com.team2.edu.video.dto;

public record VideoDetailResponse(Long videoId, String title, String description,
                                  String creatorNickname, String categoryName, String tagName,
                                  int viewCount, int likeCount, int durationSec, String status,
                                  String videoUrl) {
}
