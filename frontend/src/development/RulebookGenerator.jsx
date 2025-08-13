// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './RulebookGenerator.css'; // CSS 파일은 그대로 사용합니다.

function RulebookGenerator() {
  // 상태 변수들을 백엔드에 맞게 수정합니다.
  const [contentId, setContentId] = useState(''); // 입력받을 contentId
  const [rulebookText, setRulebookText] = useState(''); // 생성된 룰북 텍스트
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRulebookText(''); // 이전 결과 초기화

    // contentId가 숫자가 아니거나 비어있으면 에러 처리
    if (!contentId || isNaN(parseInt(contentId, 10))) {
        setError('유효한 Content ID를 숫자로 입력해주세요.');
        setLoading(false);
        return;
    }

    try {
      // Spring Boot 서버(http://localhost:8080)에 POST 요청을 보냅니다.
      // 백엔드가 요구하는 대로 { "contentId": ... } 형태의 데이터를 보냅니다.
      const response = await axios.post('http://localhost:8080/api/content/generate-rulebook', {
        contentId: parseInt(contentId, 10),
      });
      
      // 백엔드로부터 받은 rulebookText를 상태에 저장합니다.
      setRulebookText(response.data.rulebookText);

    } catch (err) {
      setError('룰북 생성에 실패했습니다. 서버 로그를 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🎲 보드게임 룰북 생성기</h1>
        <p>AI를 이용하여 보드게임 룰북 초안을 만들어보세요.</p>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="contentId">콘텐츠 ID (Content ID)</label>
            {/* 입력 필드를 contentId를 받도록 변경합니다. */}
            <input 
              id="contentId" 
              type="text" // 텍스트로 입력받되, 숫자인지 검증합니다.
              value={contentId} 
              onChange={(e) => setContentId(e.target.value)} 
              placeholder="예: 39"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? '생성 중...' : '룰북 생성하기'}
          </button>
        </form>

        {/* 에러 메시지 표시 */}
        {error && <div className="error-message">{error}</div>}
        
        {/* 로딩 인디케이터 */}
        {loading && <div className="loading-spinner"></div>}

        {/* 결과 표시 영역 */}
        {rulebookText && (
          <div className="result-container">
            <h2>🎉 룰북 생성 완료!</h2>
            {/* 생성된 룰북 텍스트를 <pre> 태그로 감싸서 줄바꿈 등을 그대로 보여줍니다. */}
            <pre className="result-text">{rulebookText}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default RulebookGenerator;