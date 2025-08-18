// WelcomeScreen.js
import React from 'react';

const WelcomeScreen = ({ onStart }) => (
  <div className="welcome-screen">
    <div className="welcome-icon">🎲</div>
    <h2>보드게임을 기획해보세요!</h2>
    <p>왼쪽 목록에서 시작할 단계를 선택하여 당신의 아이디어를 현실로 만들어보세요.</p>
    <button className="action-button" onClick={onStart}>
      첫 단계 시작하기: 게임 컨셉 제작
    </button>
  </div>
);

export default WelcomeScreen;
