// src/components/CardCarousel.js

import React, { useState } from 'react';
import './CardCarousel.css';

// 사용할 모든 이미지들을 import로 불러옵니다.
import boardgameImg1 from '../assets/boardgame1.png';
import boardgameImg2 from '../assets/boardgame2.png';
import boardgameImg3 from '../assets/boardgame3.png';
import boardgameImg4 from '../assets/boardgame4.png';
import boardgameImg from '../assets/boardgame.png';

const initialCards = [
  {
    id: 1,
    title: 'WHISPERS',
    location: 'BOARD',
    image: boardgameImg1
  },
  {
    id: 2,
    title: 'DRAGON OUEST',
    location: 'BOARD',
    image: boardgameImg2
  },
  {
    id: 3,
    title: 'AETHELGARD',
    location: 'BOARD',
    image: boardgameImg3
  },
  {
    id: 4,
    title: 'CHRONICLES',
    location: 'BOARD',
    image: boardgameImg4
  },
  {
    id: 5,
    title: 'FAMILY',
    location: 'BOARD',
    image: boardgameImg
  }
];

function CardCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="card-carousel-container">
      <div className="card-carousel-card-list">
        {initialCards.map((card, index) => {
          const offset = index - activeIndex;
          
          let className = 'card-carousel-card';
          if (offset === 0) {
            className += ' card-carousel-active';
          } else if (offset === -1) {
            className += ' card-carousel-prev';
          } else if (offset === 1) {
            className += ' card-carousel-next';
          } else if (offset < -1) {
            className += ' card-carousel-far-prev';
          } else if (offset > 1) {
            className += ' card-carousel-far-next';
          }

          return (
            <div
              key={card.id}
              className={className}
              onClick={() => handleCardClick(index)}
              style={{ backgroundImage: `url(${card.image})` }}
            >
              <div className="card-carousel-card-content">
                <h3 className="card-carousel-card-title">{card.title}</h3>
                <p className="card-carousel-card-location">{card.location}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card-carousel-controls">
        <div className="card-carousel-control-item">기획</div>
        <div className="card-carousel-control-item">개발</div>
        <div className="card-carousel-control-item"></div>
        <div className="card-carousel-control-item">보드게임</div>
      </div>
    </div>
  );
}

export default CardCarousel;