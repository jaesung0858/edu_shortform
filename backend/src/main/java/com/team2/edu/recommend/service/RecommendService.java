package com.team2.edu.recommend.service;

import com.team2.edu.recommend.dto.RecommendResponse;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.VideoRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 시청 후 추천 카드.
 * 오답이면 같은 개념 태그 영상을, 정답(또는 퀴즈 건너뜀)이면 같은 카테고리의 다른 개념 영상을 먼저 보여준다.
 * 같은 순위 안에서는 좋아요 순. 모자라면 인기 영상으로 채운다.
 */
@Service
public class RecommendService {

    static final int CARD_COUNT = 3;
    private static final int CANDIDATE_LIMIT = 50;

    private final VideoRepository videoRepository;

    public RecommendService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @Transactional(readOnly = true)
    public List<RecommendResponse> recommend(Long userId, Long videoId, boolean correct) {
        Video current = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상이 없습니다"));
        Integer tagId = current.getTag().getId();

        List<Video> candidates = new ArrayList<>(videoRepository.findRecommendCandidates(
                userId, videoId, tagId, current.getCategory().getId(), VideoStatus.PUBLIC,
                PageRequest.of(0, CANDIDATE_LIMIT)));

        // 좋아요 순으로 받아 온 목록을 순위만 다시 나눈다 (정렬이 안정적이라 좋아요 순서는 유지됨)
        candidates.sort(Comparator.comparingInt(v -> rank(v, tagId, correct)));

        List<RecommendResponse> cards = new ArrayList<>();
        for (Video video : candidates.subList(0, Math.min(CARD_COUNT, candidates.size()))) {
            cards.add(RecommendResponse.of(video, reason(video, tagId, correct)));
        }

        if (cards.size() < CARD_COUNT) {
            List<Long> excludeIds = new ArrayList<>(cards.stream().map(RecommendResponse::videoId).toList());
            excludeIds.add(videoId);
            videoRepository.findPopular(userId, excludeIds, VideoStatus.PUBLIC,
                            PageRequest.of(0, CARD_COUNT - cards.size()))
                    .forEach(video -> cards.add(RecommendResponse.of(video, "인기 영상")));
        }
        return cards;
    }

    /** 0이 먼저 나온다 */
    private int rank(Video video, Integer tagId, boolean correct) {
        boolean sameTag = video.getTag().getId().equals(tagId);
        return sameTag != correct ? 0 : 1;
    }

    private String reason(Video video, Integer tagId, boolean correct) {
        boolean sameTag = video.getTag().getId().equals(tagId);
        if (!correct) {
            return sameTag ? "틀린 개념 다시 보기" : "같은 주제";
        }
        return sameTag ? "같은 개념 더 보기" : "이어서 배우기";
    }
}
