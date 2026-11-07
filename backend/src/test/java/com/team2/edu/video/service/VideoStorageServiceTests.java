package com.team2.edu.video.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class VideoStorageServiceTests {

    private static final byte[] MP4_HEADER = {0, 0, 0, 12, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm'};

    @TempDir
    Path tempDirectory;

    @Test
    void storesWithNewNamesInsideUploadFolderAndKeepsFilesAfterRestart() throws IOException {
        VideoStorageService service = storage(100);
        MockMultipartFile file = new MockMultipartFile("file", "../../lesson.MP4", "video/mp4", MP4_HEADER);

        String first = service.store(file);
        String second = service.store(file);
        assertNotEquals(first, second);
        assertTrue(first.matches("[0-9a-f-]{36}\\.mp4"));
        assertArrayEquals(MP4_HEADER, Files.readAllBytes(tempDirectory.resolve(first)));
        new VideoStorageService(tempDirectory.toString(), DataSize.ofMegabytes(100));
        assertTrue(Files.exists(tempDirectory.resolve(first)));
        assertTrue(Files.exists(tempDirectory.resolve(second)));
    }

    @Test
    void rejectsEmptyNonMp4AndDisguisedFiles() {
        VideoStorageService service = storage(100);
        assertStatus(HttpStatus.BAD_REQUEST, () -> service.store(
                new MockMultipartFile("file", "empty.mp4", "video/mp4", new byte[0])));
        assertStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> service.store(
                new MockMultipartFile("file", "script.js", "video/mp4", MP4_HEADER)));
        assertStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> service.store(
                new MockMultipartFile("file", "fake.mp4", "video/mp4", "not a video".getBytes())));
    }

    @Test
    void rejectsFilesOverConfiguredLimit() {
        VideoStorageService service = storage(10);
        assertStatus(HttpStatus.CONTENT_TOO_LARGE, () -> service.store(
                new MockMultipartFile("file", "large.mp4", "video/mp4", MP4_HEADER)));
    }

    @Test
    void removesPartialFileWhenReadingFails() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "broken.mp4", "video/mp4", MP4_HEADER) {
            @Override
            public InputStream getInputStream() {
                return new InputStream() {
                    private int position;

                    @Override
                    public int read() throws IOException {
                        if (position == MP4_HEADER.length) {
                            throw new IOException("test read failure");
                        }
                        return MP4_HEADER[position++] & 0xff;
                    }
                };
            }
        };
        assertStatus(HttpStatus.INTERNAL_SERVER_ERROR, () -> storage(100).store(file));
        try (var files = Files.list(tempDirectory)) {
            assertEquals(0, files.count());
        }
    }

    @Test
    void refusesDeletionOutsideUploadFolder() {
        assertThrows(IllegalArgumentException.class, () -> storage(100).delete("../outside.mp4"));
    }

    @Test
    void loadsStoredFilesButRejectsMissingFilesAndOutsidePaths() throws IOException {
        VideoStorageService service = storage(100);
        String key = service.store(new MockMultipartFile("file", "lesson.mp4", "video/mp4", MP4_HEADER));
        assertArrayEquals(MP4_HEADER, service.load(key).getContentAsByteArray());
        assertStatus(HttpStatus.NOT_FOUND, () -> service.load("missing.mp4"));
        assertStatus(HttpStatus.NOT_FOUND, () -> service.load("../outside.mp4"));
        assertStatus(HttpStatus.NOT_FOUND, () -> service.load(tempDirectory.getParent().resolve("outside.mp4").toString()));
    }

    @Test
    void storesDecodedJpegUnderNewName() throws IOException {
        var image = new BufferedImage(4, 6, BufferedImage.TYPE_INT_RGB);
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", bytes);
        String key = storage(100).storeThumbnail(new MockMultipartFile("thumbnail", "frame.jpg", "image/jpeg", bytes.toByteArray()));
        assertTrue(key.matches("[0-9a-f-]{36}\\.jpg"));
        var saved = ImageIO.read(tempDirectory.resolve(key).toFile());
        assertEquals(4, saved.getWidth());
        assertEquals(6, saved.getHeight());
    }

    @Test
    void rejectsEmptyOversizedNonJpegAndOversizedDimensions() throws IOException {
        var service = storage(100);
        assertStatus(HttpStatus.BAD_REQUEST, () -> service.storeThumbnail(
                new MockMultipartFile("thumbnail", "empty.jpg", "image/jpeg", new byte[0])));
        assertStatus(HttpStatus.CONTENT_TOO_LARGE, () -> service.storeThumbnail(
                new MockMultipartFile("thumbnail", "large.jpg", "image/jpeg", new byte[1024 * 1024 + 1])));
        assertStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> service.storeThumbnail(
                new MockMultipartFile("thumbnail", "fake.jpg", "image/jpeg", "not an image".getBytes())));
        var png = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", png);
        assertStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> service.storeThumbnail(
                new MockMultipartFile("thumbnail", "fake.jpg", "image/jpeg", png.toByteArray())));
        var wide = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1921, 1, BufferedImage.TYPE_INT_RGB), "jpg", wide);
        assertStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> service.storeThumbnail(
                new MockMultipartFile("thumbnail", "wide.jpg", "image/jpeg", wide.toByteArray())));
        try (var files = Files.list(tempDirectory)) {
            assertEquals(0, files.count());
        }
    }

    private VideoStorageService storage(long maxBytes) {
        return new VideoStorageService(tempDirectory.toString(), DataSize.ofBytes(maxBytes));
    }

    private void assertStatus(HttpStatus status, org.junit.jupiter.api.function.Executable action) {
        assertEquals(status, assertThrows(ResponseStatusException.class, action).getStatusCode());
    }
}
