package com.boardgame.backend_spring;

// import 문을 추가해야 합니다.
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendSpringApplication {

	public static void main(String[] args) {
		// --- 이 부분이 추가되었습니다 ---
		// .env 파일을 메모리로 불러옵니다.
		Dotenv dotenv = Dotenv.load();

		// .env의 변수들을 자바 시스템 속성으로 설정합니다.
		// AWS SDK는 이 값들을 자동으로 찾아 사용합니다.
		System.setProperty("aws.accessKeyId", dotenv.get("AWS_ACCESS_KEY_ID"));
		System.setProperty("aws.secretAccessKey", dotenv.get("AWS_SECRET_ACCESS_KEY"));
		System.setProperty("aws.region", dotenv.get("AWS_REGION"));
		// --- 여기까지 ---

		// 기존 실행 코드
		SpringApplication.run(BackendSpringApplication.class, args);
	}

}