package com.team2.edu.video.entity;

import com.team2.edu.global.BaseTimeEntity;
import com.team2.edu.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "video")
public class Video extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id")
    private ConceptTag tag;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "video_key", nullable = false)
    private String videoKey;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    @Column(name = "duration_sec", nullable = false)
    private int durationSec;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VideoStatus status = VideoStatus.PUBLIC;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 업로드한 영상 정보
    public Video(User creator, Category category, ConceptTag tag, String title,
                 String description, String videoKey, int durationSec) {
        this.creator = creator;
        this.category = category;
        this.tag = tag;
        this.title = title;
        this.description = description;
        this.videoKey = videoKey;
        this.durationSec = durationSec;
    }

    @Override
    protected void onCreate() {
        super.onCreate();
        updatedAt = getCreatedAt();
    }

    public void attachThumbnail(String thumbnailKey) {
        this.thumbnailKey = thumbnailKey;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
