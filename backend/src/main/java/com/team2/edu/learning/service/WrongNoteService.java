package com.team2.edu.learning.service;

import com.team2.edu.learning.dto.WrongNoteListResponse;
import com.team2.edu.learning.entity.WrongNote;
import com.team2.edu.learning.repository.WrongNoteRepository;
import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.quiz.repository.QuizAttemptRepository;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.Video;
import com.team2.edu.video.entity.VideoStatus;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WrongNoteService {

    private final WrongNoteRepository wrongNoteRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public WrongNoteService(WrongNoteRepository wrongNoteRepository, QuizAttemptRepository quizAttemptRepository,
                            UserRepository userRepository) {
        this.wrongNoteRepository = wrongNoteRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userRepository = userRepository;
    }

    /** 틀린 문항을 오답 노트에 넣는다. 이미 있으면 마지막으로 틀린 시각만 갱신한다 */
    @Transactional
    public void record(User user, Quiz quiz) {
        wrongNoteRepository.findByUserIdAndQuizId(user.getId(), quiz.getId())
                .ifPresentOrElse(
                        WrongNote::wrongAgain,
                        () -> wrongNoteRepository.save(new WrongNote(user, quiz)));
    }

    /** 로그인한 회원의 오답 노트를 마지막으로 틀린 순으로 조회한다 */
    @Transactional(readOnly = true)
    public WrongNoteListResponse findMine(String email, int page) {
        var user = userRepository.findByEmail(email).filter(member -> !member.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        var notes = wrongNoteRepository.findNotes(user.getId(), VideoStatus.PUBLIC, PageRequest.of(page, 12));

        // 이 페이지 문항들의 틀린 횟수를 한 번에 센다
        var quizIds = notes.stream().map(note -> note.getQuiz().getId()).toList();
        Map<Long, Long> wrongCounts = quizIds.isEmpty() ? Map.of()
                : quizAttemptRepository.countWrong(user.getId(), quizIds).stream()
                        .collect(Collectors.toMap(QuizAttemptRepository.WrongCount::getQuizId,
                                QuizAttemptRepository.WrongCount::getWrongCount));

        var items = notes.stream().map(note -> {
            Quiz quiz = note.getQuiz();
            Video video = quiz.getVideo();
            return new WrongNoteListResponse.Item(quiz.getId(), quiz.getQuestion(), quiz.getOptions(),
                    quiz.getAnswerNo(), quiz.getExplanation(), quiz.getTag().getName(),
                    video.getId(), video.getTitle(), thumbnailUrl(video),
                    wrongCounts.getOrDefault(quiz.getId(), 0L), note.getUpdatedAt());
        }).toList();
        return new WrongNoteListResponse(items, notes.hasNext());
    }

    private static String thumbnailUrl(Video video) {
        return StringUtils.hasText(video.getThumbnailKey()) ? "/api/videos/" + video.getId() + "/thumbnail" : null;
    }
}
