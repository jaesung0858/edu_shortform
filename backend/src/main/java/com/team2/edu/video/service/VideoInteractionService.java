package com.team2.edu.video.service;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.dto.VideoLikeResponse;
import com.team2.edu.video.dto.VideoViewResponse;
import com.team2.edu.video.entity.UserVideoId;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoLike;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.VideoLikeRepository;
import com.team2.edu.video.repository.VideoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VideoInteractionService {

    private final VideoRepository videoRepository;
    private final VideoLikeRepository likeRepository;
    private final UserRepository userRepository;

    public VideoInteractionService(VideoRepository videoRepository, VideoLikeRepository likeRepository,
                                   UserRepository userRepository) {
        this.videoRepository = videoRepository;
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
    }

    // 호출 한 번당 공개 영상의 조회 수 1 증가
    @Transactional
    public VideoViewResponse addView(Long videoId) {
        Video video = publicVideoForUpdate(videoId);
        video.increaseViewCount();
        return new VideoViewResponse(videoId, video.getViewCount());
    }

    @Transactional(readOnly = true)
    public VideoLikeResponse likeStatus(Long videoId, String email) {
        User user = activeUser(email);
        Video video = videoRepository.findPublicVideo(videoId, VideoStatus.PUBLIC)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상을 찾을 수 없습니다."));
        return new VideoLikeResponse(videoId,
                likeRepository.existsById(new UserVideoId(user.getId(), videoId)), video.getLikeCount());
    }

    // 반복 요청과 동시 요청에도 회원당 한 번만 반영
    @Transactional
    public VideoLikeResponse like(Long videoId, String email) {
        User user = activeUser(email);
        Video video = publicVideoForUpdate(videoId);
        UserVideoId id = new UserVideoId(user.getId(), videoId);
        if (likeRepository.findForUpdate(id).isEmpty()) {
            likeRepository.save(new VideoLike(user, video));
            video.increaseLikeCount();
        }
        return new VideoLikeResponse(videoId, true, video.getLikeCount());
    }

    @Transactional
    public VideoLikeResponse unlike(Long videoId, String email) {
        User user = activeUser(email);
        Video video = publicVideoForUpdate(videoId);
        likeRepository.findForUpdate(new UserVideoId(user.getId(), videoId)).ifPresent(like -> {
            likeRepository.delete(like);
            video.decreaseLikeCount();
        });
        return new VideoLikeResponse(videoId, false, video.getLikeCount());
    }

    // 연결된 퀴즈·학습 기록과 파일을 유지하고 삭제 상태로 변경
    @Transactional
    public void delete(Long videoId, String email) {
        User user = activeUser(email);
        Video video = videoRepository.findForUpdate(videoId)
                .filter(item -> item.getStatus() != VideoStatus.DELETED && !item.getCreator().isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상을 찾을 수 없습니다."));
        if (!video.getCreator().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제할 수 있습니다.");
        }
        video.delete();
    }

    private Video publicVideoForUpdate(Long videoId) {
        return videoRepository.findForUpdate(videoId)
                .filter(video -> video.getStatus() == VideoStatus.PUBLIC && !video.getCreator().isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상을 찾을 수 없습니다."));
    }

    private User activeUser(String email) {
        return userRepository.findByEmail(email).filter(user -> !user.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }
}
