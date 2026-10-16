package com.team2.edu.learning.service;

import com.team2.edu.learning.entity.WrongNote;
import com.team2.edu.learning.repository.WrongNoteRepository;
import com.team2.edu.quiz.entity.Quiz;
import com.team2.edu.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WrongNoteService {

    private final WrongNoteRepository wrongNoteRepository;

    public WrongNoteService(WrongNoteRepository wrongNoteRepository) {
        this.wrongNoteRepository = wrongNoteRepository;
    }

    /** 틀린 문항을 오답 노트에 넣는다. 이미 있으면 마지막으로 틀린 시각만 갱신한다 */
    @Transactional
    public void record(User user, Quiz quiz) {
        wrongNoteRepository.findByUserIdAndQuizId(user.getId(), quiz.getId())
                .ifPresentOrElse(
                        WrongNote::wrongAgain,
                        () -> wrongNoteRepository.save(new WrongNote(user, quiz)));
    }
}
