package com.boardgame.backend_spring.plan.controller;


import com.boardgame.backend_spring.plan.entity.Plan;
import com.boardgame.backend_spring.plan.repository.PlanRepository;
import com.boardgame.backend_spring.s3.S3Uploader;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanUploadController {
    private final PlanRepository planRepository;
    private final S3Uploader s3Uploader;

    @PostMapping(value = "/{planId}/upload-doc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPlanDoc(@PathVariable Long planId,
                                                @RequestPart("file") MultipartFile file) throws IOException {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 기획안이 존재하지 않습니다. planId = " + planId));

        String uploadUrl = s3Uploader.upload(file, "plan-documents");

        plan.setPlanDocUrl(uploadUrl);
        planRepository.save(plan);

        return ResponseEntity.ok(uploadUrl);
    }

}
