import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Gallery.css';

// 1. assets 폴더에서 사용할 이미지를 import 합니다.
import playtestImage from '../assets/Playtest1.png'; 
import threedImage from '../assets/3d1.png'; 
import cardImage from '../assets/Card1.png'; 
import rulebookImage from '../assets/Rulebook.png'; 
import thumnailImage from '../assets/thumnail1.png'; 

const galleryItems = [
    { title: 'AI 생성 카드', image: cardImage },
    { title: '룰북 PDF', image: rulebookImage },
    { title: '3D 모델 썸네일', image: threedImage },
    { title: '패키지 디자인', image: thumnailImage },
    { title: '플레이 테스트', image: playtestImage }
];

const Gallery = () => {
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
    
    // ✨ 마우스 움직임에 따라 카드 스타일을 변경하는 함수
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
                <p className="bga-gallery-subtitle">BOARD.CO와 함께라면 이 모든 것이 가능합니다.</p>
                <Slider {...settings}>
                    {galleryItems.map((item, index) => (
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