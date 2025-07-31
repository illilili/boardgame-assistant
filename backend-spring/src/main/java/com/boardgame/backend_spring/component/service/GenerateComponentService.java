package com.boardgame.backend_spring.component.service;

import com.boardgame.backend_spring.component.dto.GenerateComponentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GenerateComponentService {

    private final RestTemplate restTemplate;

    // FastAPI의 구성요소 생성 API 주소 (application.properties에서 주입)
    @Value("${fastapi.service.url}/api/plans/generate-components")
    private String fastapiGenerateComponentsUrl;

    @Autowired
    public GenerateComponentService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // FastAPI를 호출하여 구성요소를 생성하는 로직
    public GenerateComponentDto.Response generateComponents(GenerateComponentDto.Request request) {
        // RestTemplate을 사용하여 FastAPI 서버에 POST 요청을 보내고, 응답을 DTO로 받습니다.
        return restTemplate.postForObject(
                fastapiGenerateComponentsUrl,
                request,
                GenerateComponentDto.Response.class
        );
    }
}