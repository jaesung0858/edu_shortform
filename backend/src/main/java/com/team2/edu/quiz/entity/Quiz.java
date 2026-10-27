package com.team2.edu.quiz.entity;

import com.team2.edu.global.BaseTimeEntity;
import com.team2.edu.video.entity.ConceptTag;
import com.team2.edu.video.entity.Video;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 영상별 4지선다 문항 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Quiz extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private Video video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id")
    private ConceptTag tag;

    @Column(nullable = false, length = 500)
    private String question;

    @Column(nullable = false, length = 200)
    private String option1;

    @Column(nullable = false, length = 200)
    private String option2;

    @Column(nullable = false, length = 200)
    private String option3;

    @Column(nullable = false, length = 200)
    private String option4;

    @Column(name = "answer_no", nullable = false, columnDefinition = "TINYINT")
    private int answerNo;

    @Column(length = 1000)
    private String explanation;

    /** 개념 태그는 영상의 태그를 그대로 쓴다 (오답 추천이 영상 태그 기준이라) */
    public Quiz(Video video, String question, List<String> options, int answerNo, String explanation) {
        this.video = video;
        this.tag = video.getTag();
        this.question = question;
        this.option1 = options.get(0);
        this.option2 = options.get(1);
        this.option3 = options.get(2);
        this.option4 = options.get(3);
        this.answerNo = answerNo;
        this.explanation = explanation;
    }

    public List<String> getOptions() {
        return List.of(option1, option2, option3, option4);
    }

    public boolean isCorrect(int selectedNo) {
        return answerNo == selectedNo;
    }
}
