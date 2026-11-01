package com.team2.edu.video.entity;

import com.team2.edu.global.BaseTimeEntity;
import com.team2.edu.user.entity.User;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "video_like")
public class VideoLike extends BaseTimeEntity {

    @EmbeddedId
    private UserVideoId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @MapsId("videoId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id")
    private Video video;

    public VideoLike(User user, Video video) {
        this.id = new UserVideoId(user.getId(), video.getId());
        this.user = user;
        this.video = video;
    }
}
