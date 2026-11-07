package com.team2.edu.video.service;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.LinkOption;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VideoStorageService {

    private final Path rootLocation;
    private final long maxFileSize;

    public VideoStorageService(
            @Value("${storage.location:uploads}") String location,
            @Value("${spring.servlet.multipart.max-file-size:100MB}") DataSize maxFileSize) {
        if (!StringUtils.hasText(location) || maxFileSize.toBytes() <= 0) {
            throw new IllegalArgumentException("영상 저장 경로와 파일 크기 제한을 확인해주세요.");
        }
        this.rootLocation = Path.of(location).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize.toBytes();
    }

    // MP4 파일을 UUID 파일명으로 저장
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "영상 파일이 비어 있습니다.");
        }
        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "영상 파일 크기 제한을 초과했습니다.");
        }
        if (!"mp4".equalsIgnoreCase(StringUtils.getFilenameExtension(file.getOriginalFilename()))) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "MP4 파일만 업로드할 수 있습니다.");
        }

        String videoKey = UUID.randomUUID() + ".mp4";
        Path destination = rootLocation.resolve(videoKey);
        boolean created = false;
        try (InputStream input = new BufferedInputStream(file.getInputStream())) {
            input.mark(12);
            byte[] header = input.readNBytes(12);
            input.reset();
            if (header.length < 12 || header[4] != 'f' || header[5] != 't'
                    || header[6] != 'y' || header[7] != 'p') {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "MP4 파일 형식을 확인해주세요.");
            }
            Files.createDirectories(rootLocation);
            Files.createFile(destination);
            created = true;
            Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            return videoKey;
        } catch (IOException e) {
            if (created) {
                try {
                    Files.deleteIfExists(destination);
                } catch (IOException cleanupError) {
                    e.addSuppressed(cleanupError);
                }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "영상 파일을 저장하지 못했습니다.", e);
        }
    }

    // JPEG 썸네일 확인 후 저장
    public String storeThumbnail(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "썸네일이 비어 있습니다.");
        }
        if (file.getSize() > 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "썸네일은 1MB 이하여야 합니다.");
        }
        BufferedImage image;
        try (var input = ImageIO.createImageInputStream(file.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "JPEG 썸네일을 확인해주세요.");
            }
            var reader = readers.next();
            try {
                reader.setInput(input);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (!"JPEG".equalsIgnoreCase(reader.getFormatName())
                        || width < 1 || height < 1 || width > 1920 || height > 1920) {
                    throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "1920픽셀 이하의 JPEG 썸네일만 사용할 수 있습니다.");
                }
                image = reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "JPEG 썸네일을 읽지 못했습니다.", e);
        }

        String key = UUID.randomUUID() + ".jpg";
        Path destination = rootLocation.resolve(key);
        boolean created = false;
        try {
            Files.createDirectories(rootLocation);
            Files.createFile(destination);
            created = true;
            if (!ImageIO.write(image, "jpg", destination.toFile())) {
                throw new IOException("JPEG writer unavailable");
            }
            return key;
        } catch (IOException e) {
            if (created) {
                try {
                    Files.deleteIfExists(destination);
                } catch (IOException cleanupError) {
                    e.addSuppressed(cleanupError);
                }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "썸네일을 저장하지 못했습니다.", e);
        }
    }

    // 저장 폴더 안의 파일 조회
    public Resource load(String videoKey) {
        Path file = rootLocation.resolve(videoKey).normalize();
        if (!rootLocation.equals(file.getParent())
                || !Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS) || !Files.isReadable(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "영상 파일을 찾을 수 없습니다.");
        }
        return new FileSystemResource(file);
    }

    // 업로드 파일 삭제
    public void delete(String videoKey) throws IOException {
        Path file = rootLocation.resolve(videoKey).normalize();
        if (!rootLocation.equals(file.getParent())) {
            throw new IllegalArgumentException("영상 저장 폴더 밖의 파일은 삭제할 수 없습니다.");
        }
        Files.deleteIfExists(file);
    }
}
