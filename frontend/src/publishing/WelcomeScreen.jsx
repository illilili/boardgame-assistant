import React from 'react';

export default function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">📋</div>
      <h2>기획안 제출 목록</h2>
      <p>왼쪽 목록에서 게임명을 클릭하여 상세 내용을 확인하세요.</p>
      <p>승인/반려 버튼으로 기획안을 검토할 수 있습니다.</p>
    </div>
  );
}
