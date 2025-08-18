import React from 'react';
import './Cta.css';

const Cta = ({ onCreateProjectClick }) => {
    return (
        <section className="cta-section">
            <div className="cta-content">
                <h2>이제, 당신의 아이디어를 현실로 만들 차례입니다.</h2>
                <button className="cta-button" onClick={onCreateProjectClick}>
                    나만의 보드게임 만들기 시작하기
                </button>
            </div>
        </section>
    );
};

export default Cta;