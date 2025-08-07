package com.boardgame.backend_spring.s3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
public class S3Uploader {

    private final S3Client s3Client;
    private final String bucket;
    private final String region; 

    public S3Uploader() {
            Dotenv dotenv = Dotenv.configure()
            .directory("/workspace/boardgame-assistant/backend-spring") // 정확한 경로 입력
            .ignoreIfMissing()
            .load();

        String accessKey = dotenv.get("AWS_ACCESS_KEY_ID");
        String secretKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
        this.region = dotenv.get("AWS_REGION");
        this.bucket = dotenv.get("AWS_S3_BUCKET");

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public String upload(MultipartFile file, String dirName) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();
        String key = dirName + "/" + uuid + "_" + originalFilename;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // S3 public URL 수동 구성
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }
}
