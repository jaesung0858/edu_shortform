package com.team2.edu.video.service;

import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.dto.VideoUploadRequest;
import com.team2.edu.video.entity.Category;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.repository.CategoryRepository;
import com.team2.edu.video.repository.ConceptTagRepository;
import com.team2.edu.video.repository.VideoRepository;
import java.io.IOException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VideoUploadServiceTests {

    private final UserRepository users = mock(UserRepository.class);
    private final CategoryRepository categories = mock(CategoryRepository.class);
    private final ConceptTagRepository tags = mock(ConceptTagRepository.class);
    private final VideoRepository videos = mock(VideoRepository.class);
    private final VideoStorageService storage = mock(VideoStorageService.class);
    private final User creator = mock(User.class);
    private final Category category = mock(Category.class);
    private final ConceptTag tag = mock(ConceptTag.class);
    private final TestTransactionManager transactions = new TestTransactionManager();
    private final MockMultipartFile file = new MockMultipartFile("file", "lesson.mp4", "video/mp4", new byte[]{1});
    private final VideoUploadRequest request = new VideoUploadRequest(" SQL JOIN ", "description", 1, 1, 60);
    private VideoUploadService service;

    @BeforeEach
    void setUp() {
        VideoUploadService target = new VideoUploadService(users, categories, tags, videos, storage);
        ProxyFactory proxy = new ProxyFactory(target);
        TransactionInterceptor interceptor = new TransactionInterceptor();
        interceptor.setTransactionManager(transactions);
        interceptor.setTransactionAttributeSource(new AnnotationTransactionAttributeSource());
        interceptor.afterPropertiesSet();
        proxy.addAdvice(interceptor);
        service = (VideoUploadService) proxy.getProxy();
        when(users.findByEmail("learner@example.com")).thenReturn(Optional.of(creator));
        when(categories.findById(1)).thenReturn(Optional.of(category));
        when(category.getId()).thenReturn(1);
        when(tags.findById(1)).thenReturn(Optional.of(tag));
        when(tag.getCategory()).thenReturn(category);
        when(storage.store(file)).thenReturn("saved.mp4");
        when(videos.saveAndFlush(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void recordsLoggedInCreatorAndMetadataAndKeepsCommittedFile() throws IOException {
        var response = service.upload("learner@example.com", file, request, null);
        ArgumentCaptor<Video> saved = ArgumentCaptor.forClass(Video.class);
        verify(videos).saveAndFlush(saved.capture());
        assertSame(creator, saved.getValue().getCreator());
        assertSame(category, saved.getValue().getCategory());
        assertSame(tag, saved.getValue().getTag());
        assertEquals(60, saved.getValue().getDurationSec());
        assertEquals("SQL JOIN", response.title());
        assertEquals("saved.mp4", response.videoKey());
        verify(storage, never()).delete(any());
    }

    @Test
    void rejectsMissingOrDeletedMemberBeforeStoringFile() {
        when(users.findByEmail("learner@example.com")).thenReturn(Optional.empty());
        assertStatus(HttpStatus.UNAUTHORIZED);
        when(users.findByEmail("learner@example.com")).thenReturn(Optional.of(creator));
        when(creator.isDeleted()).thenReturn(true);
        assertStatus(HttpStatus.UNAUTHORIZED);
        verifyNoInteractions(storage);
    }

    @Test
    void rejectsMissingCategoryAndTagBeforeStoringFile() {
        when(categories.findById(1)).thenReturn(Optional.empty());
        assertStatus(HttpStatus.NOT_FOUND);
        when(categories.findById(1)).thenReturn(Optional.of(category));
        when(tags.findById(1)).thenReturn(Optional.empty());
        assertStatus(HttpStatus.NOT_FOUND);
        verifyNoInteractions(storage);
    }

    @Test
    void rejectsTagFromAnotherCategoryBeforeStoringFile() {
        Category other = mock(Category.class);
        when(other.getId()).thenReturn(2);
        when(tag.getCategory()).thenReturn(other);
        assertStatus(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(storage);
    }

    @Test
    void removesStoredFileWhenDatabaseWriteFails() throws IOException {
        when(videos.saveAndFlush(any(Video.class))).thenThrow(new DataIntegrityViolationException("test DB failure"));
        assertThrows(DataIntegrityViolationException.class, () -> service.upload("learner@example.com", file, request, null));
        verify(storage).delete("saved.mp4");
    }

    @Test
    void removesStoredFileWhenTransactionCommitFails() throws IOException {
        transactions.failCommit = true;
        assertThrows(TransactionSystemException.class, () -> service.upload("learner@example.com", file, request, null));
        verify(storage).delete("saved.mp4");
    }

    @Test
    void storesThumbnailKeyAndRemovesBothFilesOnCommitFailure() throws IOException {
        var thumbnail = new MockMultipartFile("thumbnail", "frame.jpg", "image/jpeg", new byte[]{1});
        when(storage.storeThumbnail(thumbnail)).thenReturn("saved.jpg");
        service.upload("learner@example.com", file, request, thumbnail);
        var saved = ArgumentCaptor.forClass(Video.class);
        verify(videos).saveAndFlush(saved.capture());
        assertEquals("saved.jpg", saved.getValue().getThumbnailKey());
        verify(storage, never()).delete(any());

        transactions.failCommit = true;
        assertThrows(TransactionSystemException.class,
                () -> service.upload("learner@example.com", file, request, thumbnail));
        verify(storage).delete("saved.mp4");
        verify(storage).delete("saved.jpg");
    }

    @Test
    void removesVideoIfThumbnailIsRejected() throws IOException {
        var thumbnail = new MockMultipartFile("thumbnail", "frame.jpg", "image/jpeg", new byte[]{1});
        when(storage.storeThumbnail(thumbnail)).thenThrow(new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE));
        assertThrows(ResponseStatusException.class,
                () -> service.upload("learner@example.com", file, request, thumbnail));
        verify(storage).delete("saved.mp4");
        verifyNoInteractions(videos);
    }

    private void assertStatus(HttpStatus status) {
        assertEquals(status, assertThrows(ResponseStatusException.class,
                () -> service.upload("learner@example.com", file, request, null)).getStatusCode());
    }

    private static class TestTransactionManager extends AbstractPlatformTransactionManager {
        private boolean failCommit;

        TestTransactionManager() {
            setRollbackOnCommitFailure(true);
        }

        @Override
        protected Object doGetTransaction() {
            return new Object();
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
        }

        @Override
        protected void doCommit(DefaultTransactionStatus status) {
            if (failCommit) {
                throw new TransactionSystemException("test commit failure");
            }
        }

        @Override
        protected void doRollback(DefaultTransactionStatus status) {
        }
    }
}
