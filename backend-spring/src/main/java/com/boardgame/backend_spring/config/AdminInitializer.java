package com.boardgame.backend_spring.config;

import com.boardgame.backend_spring.user.entity.User;
import com.boardgame.backend_spring.user.entity.User.Role;
import com.boardgame.backend_spring.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            if (userRepository.findById(1L).isEmpty()) {
                User admin = User.builder()
                        .email("admin@game.com")
                        .password(passwordEncoder.encode("1234"))
                        .name("관리자")
                        .role(Role.ADMIN)
                        .company("AIVLE")
                        .build();

                userRepository.save(admin);
                System.out.println("관리자 계정이 생성되었습니다: admin@game.com / 1234");
            }
        };
    }
}
