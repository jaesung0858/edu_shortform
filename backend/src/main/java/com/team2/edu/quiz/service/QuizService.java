package com.team2.edu.quiz.service;

import com.team2.edu.learning.service.WrongNoteService;
import com.team2.edu.quiz.dto.AnswerResponse;
import com.team2.edu.quiz.dto.QuizResponse;
import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.quiz.entity.QuizAttempt;
import com.team2.edu.quiz.repository.QuizAttemptRepository;
import com.team2.edu.quiz.repository.QuizRepository;
import com.team2.edu.user.entity.User;
import com.team2.edu.user.repository.UserRepository;
import com.team2.edu.video.entity.VideoStatus;
import com.team2.edu.video.repository.VideoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final WrongNoteService wrongNoteService;

    public QuizService(QuizRepository quizRepository, QuizAttemptRepository quizAttemptRepository,
                       UserRepository userRepository, VideoRepository videoRepository,
                       WrongNoteService wrongNoteService) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.wrongNoteService = wrongNoteService;
    }

    /** 퀴즈 출제: 영상에 등록된 문항 (1~2개) */
    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzes(Long videoId) {
        requirePublicVideo(videoId);
        return quizRepository.findByVideoIdOrderByIdAsc(videoId).stream()
                .map(QuizResponse::from)
                .toList();
    }

    /** 퀴즈 채점: 풀이 기록을 남기고, 틀리면 오답 노트에 넣는다 */
    @Transactional
    public AnswerResponse answer(Long userId, Long quizId, int selectedNo) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원이 없습니다"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "퀴즈가 없습니다"));
        requirePublicVideo(quiz.getVideo().getId());

        QuizAttempt attempt = quizAttemptRepository.save(new QuizAttempt(user, quiz, selectedNo));
        if (!attempt.isCorrect()) {
            wrongNoteService.record(user, quiz);
        }

        return new AnswerResponse(
                attempt.isCorrect(),
                quiz.getAnswerNo(),
                quiz.getExplanation(),
                quiz.getTag().getName(),
                !attempt.isCorrect());
    }

    /** 숨김·삭제된 영상의 퀴즈는 없는 것으로 본다 (영상 상세 API와 같은 기준) */
    private void requirePublicVideo(Long videoId) {
        videoRepository.findPublicVideo(videoId, VideoStatus.PUBLIC)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "영상이 없습니다"));
    }
}
