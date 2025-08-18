import React from 'react';
// ✨ 아이콘 라이브러리를 사용하여 전문성 및 일관성 확보
import { FaLightbulb } from 'react-icons/fa';
import './WelcomeScreen.css'; // ✨ WelcomeScreen 전용 CSS 파일을 import 합니다.

const WelcomeScreen = ({ onStart }) => (
    <div className="welcome-screen">
        <div className="welcome-content">
            {/* ✨ 아이디어와 창의성을 상징하는 아이콘으로 교체 */}
            <div className="welcome-icon-wrapper">
                <FaLightbulb className="welcome-icon" />
            </div>
            <h2 className="welcome-title">모든 위대한 여정은 첫걸음부터</h2>
            <p className="welcome-subtitle">
                왼쪽 메뉴에서 단계를 선택하거나 아래 버튼을 눌러,
                <br />
                당신의 아이디어를 현실로 만드는 첫 단계를 시작하세요.
            </p>
            <button className="welcome-start-button" onClick={onStart}>
                <span>첫 단계 시작하기: 컨셉 제작</span>
            </button>
        </div>
    </div>
);

export default WelcomeScreen;