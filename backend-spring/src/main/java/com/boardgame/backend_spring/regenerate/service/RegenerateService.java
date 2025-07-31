package com.boardgame.backend_spring.regenerate.service;

import com.boardgame.backend_spring.regenerate.dto.RegenerateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class RegenerateService {

    private final RestTemplate restTemplate;

    @Value("${fastapi.service.url}/api/plans/regenerate-concept")
    private String regenConceptApiUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-components")
    private String regenComponentsApiUrl;

    @Value("${fastapi.service.url}/api/plans/regenerate-rule")
    private String regenRuleApiUrl;

    @Autowired
    public RegenerateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RegenerateDto.ConceptResponse regenerateConcept(RegenerateDto.ConceptRequest request) {
        return restTemplate.postForObject(regenConceptApiUrl, request, RegenerateDto.ConceptResponse.class);
    }

    public RegenerateDto.ComponentsResponse regenerateComponents(RegenerateDto.ComponentsRequest request) {
        return restTemplate.postForObject(regenComponentsApiUrl, request, RegenerateDto.ComponentsResponse.class);
    }

    public RegenerateDto.RuleResponse regenerateRule(RegenerateDto.RuleRequest request) {
        return restTemplate.postForObject(regenRuleApiUrl, request, RegenerateDto.RuleResponse.class);
    }
}