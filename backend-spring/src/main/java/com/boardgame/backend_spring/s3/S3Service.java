package com.boardgame.backend_spring.s3;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import io.github.cdimascio.dotenv.Dotenv;

@Slf4j
@Service
public class S3Service {

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String accessKey = dotenv.get("AWS_ACCESS_KEY_ID");
        String secretKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
        String region = dotenv.get("AWS_REGION");
        String bucket = dotenv.get("AWS_S3_BUCKET");

        log.info("🔐 AWS_ACCESS_KEY_ID: {}", accessKey);
        log.info("AWS_REGION: {}", region);
        log.info("S3_BUCKET_NAME: {}", bucket);

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    public void listFiles() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String bucket = dotenv.get("AWS_S3_BUCKET");

        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucket)
                .maxKeys(10)
                .build();

        ListObjectsV2Response result = s3Client.listObjectsV2(request);

        log.info("S3 버킷 '{}' 안에 있는 객체 목록:", bucket);
        result.contents().forEach(obj -> {
            log.info(" - {}", obj.key());
        });
    }
}
