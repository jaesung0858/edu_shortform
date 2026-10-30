package com.team2.edu.video.service;

import com.team2.edu.video.dto.VideoListResponse;
import com.team2.edu.video.dto.VideoDetailResponse;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.VideoRepository;
import com.team2.edu.user.repository.UserRepository;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.util.StringUtils;

@Service
public class VideoQueryService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final VideoStorageService storageService;

    public VideoQueryService(VideoRepository videoRepository, UserRepository userRepository,
                             VideoStorageService storageService) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    // 공개 영상을 최신 등록순으로 조회
    @Transactional(readOnly = true)
    public VideoListResponse findAll(int page, Integer categoryId, String keyword) {
        var pageable = PageRequest.of(page, 12, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        String pattern = "%" + keyword.strip().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        var videos = videoRepository.findPublicVideos(VideoStatus.PUBLIC, categoryId, pattern, pageable);
        var categories = videoRepository.findPublicCategories(VideoStatus.PUBLIC).stream()
                .map(category -> new VideoListResponse.CategoryOption(category.getId(), category.getName()))
                .toList();
        return new VideoListResponse(toItems(videos), categories, videos.hasNext());
    }

    // 로그인한 회원이 올린 영상 조회
    @Transactional(readOnly = true)
    public VideoListResponse findMine(String email, int page) {
        userRepository.findByEmail(email).filter(user -> !user.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        var pageable = PageRequest.of(page, 12, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        var videos = videoRepository.findMyVideos(email, VideoStatus.DELETED, pageable);
        return new VideoListResponse(toItems(videos), List.of(), videos.hasNext());
    }

    @Transactional(readOnly = true)
    public VideoDetailResponse detail(Long videoId, String email) {
        Video video = accessibleVideo(videoId, email);
        return new VideoDetailResponse(video.getId(), video.getTitle(), video.getDescription(),
                video.getCreator().getNickname(), video.getCategory().getName(), video.getTag().getName(),
                video.getViewCount(), video.getLikeCount(), video.getDurationSec(), video.getStatus().name(),
                "/api/videos/" + video.getId() + "/content", thumbnailUrl(video));
    }

    @Transactional(readOnly = true)
    public Resource content(Long videoId, String email) {
        return storageService.load(accessibleVideo(videoId, email).getVideoKey());
    }

    @Transactional(readOnly = true)
    public Resource thumbnail(Long videoId, String email) {
        Video video = accessibleVideo(videoId, email);
        if (!StringUtils.hasText(video.getThumbnailKey())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "썸네일이 없습니다.");
        }
        return storageService.load(video.getThumbnailKey());
    }

    private String thumbnailUrl(Video video) {
        return StringUtils.hasText(video.getThumbnailKey()) ? "/api/videos/" + video.getId() + "/thumbnail" : null;
    }

    private Video accessibleVideo(Long videoId, String email) {
        return videoRepository.findAccessibleVideo(videoId, email, VideoStatus.PUBLIC, VideoStatus.DELETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상을 찾을 수 없습니다."));
    }

    private List<VideoListResponse.Item> toItems(Slice<Video> videos) {
        return videos.stream()
                .map(video -> new VideoListResponse.Item(video.getId(), video.getTitle(),
                        video.getCreator().getNickname(), video.getCategory().getId(),
                        video.getCategory().getName(), video.getTag().getName(),
                        video.getViewCount(), video.getLikeCount(), video.getDurationSec(),
                        video.getCreatedAt(), video.getStatus().name(), thumbnailUrl(video)))
                .toList();
    }
}
