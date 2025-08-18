import React from 'react';
import { FaBrain, FaPaintBrush, FaUsers } from 'react-icons/fa';
import './FeatureHighlights.css';
import illustration from '../assets/feature-illustration.png';

const FeatureHighlights = () => {
    return (
        <section className="feature-highlights">
            <div className="illustration-wrapper">
                <img src={illustration} alt="Board game creation process illustration" />
            </div>
            <div className="features-list">
                <h4>핵심 기능</h4>
                <ul>
                    <li><FaBrain /> AI 기획 어시스턴트</li>
                    <li><FaPaintBrush /> 컴포넌트 자동 생성</li>
                    <li><FaUsers /> 밸런스 & 저작권 분석</li>
                </ul>
            </div>
        </section>
    );
};

export default FeatureHighlights;