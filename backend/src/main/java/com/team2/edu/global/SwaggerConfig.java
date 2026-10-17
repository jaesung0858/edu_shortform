package com.team2.edu.global;

import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import java.util.Arrays;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger에서 @CurrentUserId 파라미터를 X-User-Id 헤더 입력칸으로 보여준다.
 * TODO 로그인 연동 후 CurrentUserIdResolver와 함께 정리
 */
@Configuration
class SwaggerConfig {

    static {
        // 기본으로는 userId가 쿼리 파라미터로 잘못 표시돼서 숨긴다
        SpringDocUtils.getConfig().addAnnotationsToIgnore(CurrentUserId.class);
    }

    @Bean
    OperationCustomizer currentUserIdHeader() {
        return (operation, handlerMethod) -> {
            boolean usesCurrentUser = Arrays.stream(handlerMethod.getMethodParameters())
                    .anyMatch(p -> p.hasParameterAnnotation(CurrentUserId.class));
            if (usesCurrentUser) {
                operation.addParametersItem(new HeaderParameter()
                        .name(CurrentUserIdResolver.HEADER)
                        .required(true)
                        .description("임시 로그인: 회원 번호 (목데이터 학습자 = 2)")
                        .schema(new IntegerSchema()));
            }
            return operation;
        };
    }
}
