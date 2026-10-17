package com.team2.edu.global;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 파라미터에 붙이면 요청한 회원 번호가 들어온다.
 * 지금은 로그인 연동 전이라 X-User-Id 헤더에서 읽는다 (CurrentUserIdResolver).
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUserId {
}
