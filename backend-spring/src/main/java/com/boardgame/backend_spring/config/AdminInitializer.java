package com.boardgame.backend_spring.config;

import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.entity.User.Role;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * 서버 시작 시 관리자 계정을 자동 생성하는 설정 클래스
 */
@Configuration
@RequiredArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner createAdminUser() {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .email("admin@game.com")
                        .password(passwordEncoder.encode("1234"))
                        .name("관리자")
                        .role(Role.ADMIN)
                        .company("AIVLE")
                        .build();

                User planner = User.builder()
                        .email("planner@game.com")
                        .password(passwordEncoder.encode("1234"))
                        .name("기획자")
                        .role(Role.PLANNER)
                        .company("AIVLE")
                        .build();

                User developer = User.builder()
                        .email("developer@game.com")
                        .password(passwordEncoder.encode("1234"))
                        .name("개발자")
                        .role(Role.DEVELOPER)
                        .company("AIVLE")
                        .build();

                User publisher = User.builder()
                        .email("publisher@game.com")
                        .password(passwordEncoder.encode("1234"))
                        .name("퍼블리셔")
                        .role(Role.PUBLISHER)
                        .company("AIVLE")
                        .build();

                userRepository.saveAll(List.of(admin, planner, developer, publisher));
                System.out.println("기본 유저가 생성되었습니다 : admin@game.com / 1234");
            }
        };
    }
}
