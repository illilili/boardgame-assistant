import React, { forwardRef } from 'react';
import { FaLightbulb, FaTools, FaPaperPlane } from 'react-icons/fa';
import './HowToUse.css';

const HowToUse = forwardRef((props, ref) => {
    const steps = [
        {
            icon: <FaLightbulb />,
            title: "기획안 작성",
            description: "AI 어시스턴트와 함께 게임의 핵심 아이디어를 구체화하고 체계적인 기획안을 완성하세요."
        },
        {
            icon: <FaTools />,
            title: "개발",
            description: "생성된 기획안을 바탕으로 카드, 룰북, 3D 모델 등 게임 컴포넌트를 손쉽게 제작합니다."
        },
        {
            icon: <FaPaperPlane />,
            title: "퍼블리싱",
            description: "완성된 게임을 커뮤니티에 공유하고, 전문가의 피드백을 받아 더 멋진 게임으로 발전시키세요."
        }
    ];

    return (
        <section ref={ref} id="how-to-use" className="how-to-use-section">
            <h2>보드게임 제작, 3단계로 완성하기</h2>
            <p className="section-subtitle">복잡한 과정은 BOARD.CO에 맡기고, 당신은 창의적인 아이디어에만 집중하세요.</p>
            <div className="steps-container">
                {steps.map((step, index) => (
                    <div className="step-card" key={index}>
                        <div className="step-icon">{step.icon}</div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
});

export default HowToUse;