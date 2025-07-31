package com.boardgame.backend_spring.s3test;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class S3TestController {

    private final S3Service s3Service;

    @GetMapping("/s3/test")
    public String testS3() {
        s3Service.listFiles();
        return "S3 연결 테스트 완료 - 로그 확인!";
    }
}
