package com.team2.edu.global;

import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger에서 @CurrentUserId 파라미터를 숨긴다. 회원 번호는 로그인 세션에서 꺼내므로 입력받지 않는다.
 * Swagger로 학습 API를 시험할 때는 같은 브라우저에서 먼저 /login 으로 로그인한다.
 */
@Configuration
class SwaggerConfig {

    static {
        // 기본으로는 userId가 쿼리 파라미터로 잘못 표시돼서 숨긴다
        SpringDocUtils.getConfig().addAnnotationsToIgnore(CurrentUserId.class);
    }
}
