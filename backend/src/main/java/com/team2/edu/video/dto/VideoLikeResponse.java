package com.team2.edu.video.dto;

public record VideoLikeResponse(Long videoId, boolean liked, int likeCount) {
}
