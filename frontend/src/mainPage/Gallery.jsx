import React, { useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Gallery.css';

// 1. assets 폴더에서 사용할 이미지를 import 합니다.
import playtestImage from '../assets/Playtest1.png';
import playtestImage1 from '../assets/Playtest2.png';
import playtestImage2 from '../assets/Playtest3.png';
import playtestImage3 from '../assets/Playtest4.png';
import playtestImage4 from '../assets/Playtest5.png';

import threedImage from '../assets/3d1.png';
import threedImage1 from '../assets/3d2.png';
import threedImage2 from '../assets/3d3.png';
import threedImage3 from '../assets/3d4.png';
import threedImage4 from '../assets/3d5.png';
import cardImage from '../assets/Card1.png';
import cardImage1 from '../assets/Card2.png';
import cardImage2 from '../assets/Card3.png';
import cardImage3 from '../assets/Card4.png';
import cardImage4 from '../assets/Card5.png';

import rulebookImage from '../assets/Rulebook.png';
import rulebookImage1 from '../assets/Rulebook1.png';
import rulebookImage2 from '../assets/Rulebook2.png';
import rulebookImage3 from '../assets/Rulebook3.png';
import rulebookImage4 from '../assets/Rulebook4.png';

import thumnailImage from '../assets/thumnail1.png';
import thumnailImage1 from '../assets/thumnail2.png';
import thumnailImage2 from '../assets/thumnail3.png';
import thumnailImage3 from '../assets/thumnail4.png';
import thumnailImage4 from '../assets/thumnail5.png';


// 2. 데이터를 카테고리별로 그룹화합니다. (각 5개씩 예시)
const galleryData = {
    'AI 생성 카드': [
        { title: '거인의 축복 카드', image: cardImage },
        { title: '고슴도치의 경고', image: cardImage1 },
        { title: '영역 확장 카드', image: cardImage2 },
        { title: '거인공격 방어카드', image: cardImage3 },
        { title: '실험 방해 카드', image: cardImage4 },
    ],
    '3D 피규어': [
        { title: '강철 병사', image: threedImage },
        { title: '거신의 형상', image: threedImage1 },
        { title: '검투사 전사', image: threedImage2 },
        { title: '그림자 탐정', image: threedImage3 },
        { title: '모험의 선구자', image: threedImage4 },
    ],
    '패키지 디자인': [
        { title: '시간의 잔광', image: thumnailImage },
        { title: '벽 너머의 전쟁', image: thumnailImage1 },
        { title: '그림자 암투', image: thumnailImage2 },
        { title: '침략자 X', image: thumnailImage3 },
        { title: '팜팜 어드벤쳐', image: thumnailImage4 },
    ],
    '룰북': [
        { title: '불꽃놀이 축제', image: rulebookImage },
        { title: '천사의 모험', image: rulebookImage1 },
        { title: '야채 친구들', image: rulebookImage2 },
        { title: '동물과 야채', image: rulebookImage3 },
        { title: '그림자 전쟁', image: rulebookImage4 },
    ],
    '기타 재료': [
        { title: '표창 토큰', image: playtestImage },
        { title: '황금의 상자', image: playtestImage1 },
        { title: '짐꾼의 수레', image: playtestImage2 },
        { title: '운명의 주사위', image: playtestImage3 },
        { title: '독화살 토큰', image: playtestImage4 },
    ]
};

const categories = Object.keys(galleryData);

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState(categories[0]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: '60px',
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 1, centerPadding: '40px' }
            }
        ]
    };

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const mouseX = (x / width) * 100;
        const mouseY = (y / height) * 100;

        card.style.setProperty('--mouse-x', `${mouseX}%`);
        card.style.setProperty('--mouse-y', `${mouseY}%`);
    };

    return (
        <section className="bga-gallery-section">
            <div className="bga-gallery-container">
                <h2 className="bga-gallery-title">대표 산출물 갤러리</h2>
                <p align="center" className="bga-gallery-subtitle">BOARD.CO와 함께라면 아이디어가 현실이 되고, 상상은 새로운 게임으로 태어납니다. 보드게임을 만드는 모든 과정, BOARD.CO가 함께합니다.</p>

                {/* --- 카테고리 선택 버튼 --- */}
                <div className="bga-category-nav">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`bga-category-button ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* --- 선택된 카테고리의 캐러셀 --- */}
                <Slider {...settings}>
                    {galleryData[activeCategory].map((item, index) => (
                        <div key={index} className="bga-gallery-slide">
                            <div
                                className="bga-gallery-card"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.setProperty('--mouse-x', '50%');
                                    e.currentTarget.style.setProperty('--mouse-y', '50%');
                                }}
                            >
                                <img src={item.image} alt={item.title} className="bga-gallery-card__image" />
                                <div className="bga-gallery-card__caption">{item.title}</div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default Gallery;