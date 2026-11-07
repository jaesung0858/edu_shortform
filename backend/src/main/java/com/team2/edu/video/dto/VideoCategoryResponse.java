package com.team2.edu.video.dto;

import java.util.List;

public record VideoCategoryResponse(Integer categoryId, String name, List<Tag> tags) {
    public record Tag(Integer tagId, String name) {
    }
}
