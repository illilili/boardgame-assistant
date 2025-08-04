import React from 'react';
import illustration from '../assets/boardgame-illustration.png';

function MainContent() {
  return (
    <main className="main-content-v2">
      <div className="text-section-v2">
        <h1 className="main-headline">
          Where Your<br />Game Ideas<br />Come to Life
        </h1>
        <p className="main-description">
          Stop just dreaming about your perfect board game. With our intuitive tools and rich asset library, you can design, prototype, and share your creation with the world. Ready to play?
        </p>
        <div className="main-cta-group">
          <button className="cta-button yellow">Create Your First Game</button>
          <a href="#how-it-works" className="secondary-link">How it works →</a>
        </div>
      </div>
      <div className="image-section-v2">
        <img src={illustration} alt="Children playing a board game" />
      </div>
    </main>
  );
}

export default MainContent;