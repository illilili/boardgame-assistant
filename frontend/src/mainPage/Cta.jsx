import React from 'react';
import './Cta.css';

const Cta = ({ onCreateProjectClick }) => {
    return (
        <section className="bga-cta-section">
            {/* 동적인 배경 효과를 위한 요소 */}
            <div className="bga-cta-aurora"></div>

            <div className="bga-cta-content">
                <h2 className="bga-cta-title">이제, 당신의 아이디어를 현실로 만들 차례입니다.</h2>
                <button className="bga-cta-button" onClick={onCreateProjectClick}>
                    나만의 보드게임 만들기 시작하기
                </button>
            </div>
        </section>
    );
};

export default Cta;