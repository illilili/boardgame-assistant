// Footer.js
import React from 'react';
import './Footer.css'; // 푸터 전용 CSS 파일을 임포트합니다.

// onPrivacyClick과 onTermsClick prop을 받도록 수정합니다.
function Footer({ onPrivacyClick, onTermsClick }) {
    return (
        <footer className="footer-v3">
            <div className="footer-links-container">
                {/* 개인정보처리방침 링크 클릭 시 onPrivacyClick 함수를 호출합니다. */}
                <a href="/privacy" onClick={onPrivacyClick}>개인정보처리방침</a>
                {/* 이용약관 링크 클릭 시 onTermsClick 함수를 호출합니다. */}
                <a href="/terms" onClick={onTermsClick}>이용약관</a>
            </div>
            <p className="company-info">
                (주)보드게임 어시스턴스 대전광역시 서구 둔산로 123 (탄방동) 대표이사: 이정훈 사업자등록번호: 123-45-67890 통신판매업신고: 2025-대전둔산-0001
            </p>
            <p className="copyright">
                © 2025 Boardgame Assistant Inc. All rights reserved.
            </p>
        </footer>
    );
}

export default Footer;