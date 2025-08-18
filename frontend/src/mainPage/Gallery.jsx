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

// 임시 이미지 URL
const sampleImages = {
    card: cardImage,
    rulebook: rulebookImage,
    model3d: threedImage,
    packaging: thumnailImage,
    gameplay: playtestImage 
};

const Gallery = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: '40px',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const galleryItems = [
        { title: 'AI 생성 카드', image: sampleImages.card },
        { title: '룰북 PDF', image: sampleImages.rulebook },
        { title: '3D 모델 썸네일', image: sampleImages.model3d },
        { title: '패키지 디자인', image: sampleImages.packaging },
        { title: '플레이 테스트', image: sampleImages.gameplay }
    ];

    return (
        <section className="gallery-section">
            <h2>대표 산출물 갤러리</h2>
            <p className="gallery-subtitle">BOARD.CO와 함께라면 이 모든 것이 가능합니다.</p>
            <Slider {...settings}>
                {galleryItems.map((item, index) => (
                    <div key={index} className="gallery-card-wrapper">
                        <div className="gallery-card">
                            <img src={item.image} alt={item.title} className="gallery-image" />
                            <div className="gallery-caption">{item.title}</div>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default Gallery;