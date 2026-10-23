package com.team2.edu.video.service;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.dto.VideoUploadRequest;
import com.team2.edu.video.dto.VideoCategoryResponse;
import com.team2.edu.video.dto.VideoCategoryRequest;
import com.team2.edu.video.dto.VideoTagRequest;
import com.team2.edu.video.dto.VideoUploadResponse;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VideoUploadService {

    private static final Logger log = LoggerFactory.getLogger(VideoUploadService.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ConceptTagRepository conceptTagRepository;
    private final VideoRepository videoRepository;
    private final VideoStorageService storageService;

    public VideoUploadService(UserRepository userRepository, CategoryRepository categoryRepository,
                              ConceptTagRepository conceptTagRepository, VideoRepository videoRepository,
                              VideoStorageService storageService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.conceptTagRepository = conceptTagRepository;
        this.videoRepository = videoRepository;
        this.storageService = storageService;
    }

    // 카테고리별 개념 태그 조회
    @Transactional(readOnly = true)
    public List<VideoCategoryResponse> categories() {
        List<ConceptTag> tags = conceptTagRepository.findAll(Sort.by("id"));
        return categoryRepository.findAll(Sort.by("id")).stream()
                .map(category -> new VideoCategoryResponse(category.getId(), category.getName(),
                        tags.stream()
                                .filter(tag -> tag.getCategory().getId().equals(category.getId()))
                                .map(tag -> new VideoCategoryResponse.Tag(tag.getId(), tag.getName()))
                                .toList()))
                .toList();
    }

    // 카테고리 이름은 모든 회원이 함께 사용
    @Transactional
    public VideoCategoryResponse createCategory(VideoCategoryRequest request) {
        String name = request.name().strip();
        if (categoryRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 카테고리입니다.");
        }
        try {
            Category category = categoryRepository.saveAndFlush(new Category(name));
            return new VideoCategoryResponse(category.getId(), category.getName(), List.of());
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 카테고리입니다.");
        }
    }

    // 선택한 카테고리에 태그 추가
    @Transactional
    public VideoCategoryResponse.Tag createTag(Integer categoryId, VideoTagRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
        String name = request.name().strip();
        if (conceptTagRepository.existsByCategory_IdAndName(categoryId, name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 개념 태그입니다.");
        }
        try {
            ConceptTag tag = conceptTagRepository.saveAndFlush(new ConceptTag(category, name));
            return new VideoCategoryResponse.Tag(tag.getId(), tag.getName());
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 개념 태그입니다.");
        }
    }

    // 로그인한 회원의 영상 등록
    @Transactional
    public VideoUploadResponse upload(String email, MultipartFile file, VideoUploadRequest request) {
        User creator = userRepository.findByEmail(email)
                .filter(user -> !user.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
        ConceptTag tag = conceptTagRepository.findById(request.tagId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "개념 태그를 찾을 수 없습니다."));
        if (!tag.getCategory().getId().equals(category.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리에 속한 개념 태그를 선택해주세요.");
        }

        String videoKey = storageService.store(file);
        // DB 롤백 시 파일도 삭제 (커밋 중 실패한 경우 포함)
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    try {
                        storageService.delete(videoKey);
                    } catch (IOException e) {
                        log.error("등록 실패 영상 파일 정리 필요: {}", videoKey, e);
                    }
                }
            }
        });

        Video video = videoRepository.saveAndFlush(new Video(creator, category, tag,
                request.title().trim(), request.description(), videoKey, request.durationSec()));
        return new VideoUploadResponse(video.getId(), video.getTitle(), video.getVideoKey());
    }
}
