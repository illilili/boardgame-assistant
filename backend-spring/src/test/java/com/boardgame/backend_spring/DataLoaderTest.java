package com.boardgame.backend_spring;

import com.boardgame.backend_spring.trendanalysis.dataloader.DataLoaderService;
import com.boardgame.backend_spring.trendanalysis.original.repository.BoardgameTrendRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=none",
    "app.dataloader.enabled=true",
    "app.dataloader.max-records=5"
})
public class DataLoaderTest {

    @Autowired
    private DataLoaderService dataLoaderService;
    
    @Autowired
    private BoardgameTrendRepository repository;

    @Test
    public void testDataLoader() {
        System.out.println("🧪 데이터로더 테스트 시작");
        
        // 프로젝트 기준 상대 경로 확인
        String currentDir = System.getProperty("user.dir");
        String csvPath = currentDir + "/../backend-python/pricing/data/bgg_data.csv";
        System.out.println("📁 현재 디렉토리: " + currentDir);
        System.out.println("📄 CSV 파일 경로: " + csvPath);
        
        // 파일 존재 확인
        java.io.File csvFile = new java.io.File(csvPath);
        if (!csvFile.exists()) {
            System.out.println("❌ CSV 파일이 존재하지 않습니다: " + csvPath);
            return;
        }
        System.out.println("✅ CSV 파일 확인됨");
        
        // 기존 데이터 확인
        long beforeCount = repository.count();
        System.out.println("📊 로드 전 데이터 개수: " + beforeCount);
        
        // 데이터 로드 실행
        try {
            dataLoaderService.loadBoardgameDataFromLocal();
            System.out.println("✅ 데이터 로드 성공");
        } catch (Exception e) {
            System.out.println("❌ 데이터 로드 실패: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 로드 후 데이터 확인
        long afterCount = repository.count();
        System.out.println("📊 로드 후 데이터 개수: " + afterCount);
        System.out.println("🎯 로드된 데이터: " + (afterCount - beforeCount) + "개");
    }
}