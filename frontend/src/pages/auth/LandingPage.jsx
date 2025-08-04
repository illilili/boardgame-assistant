import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>LandingPage</h2>

      <Link to="/login">
        <button style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}>
          로그인 하러 가기
        </button>
      </Link>
    </div>
  );
};

export default LandingPage;
