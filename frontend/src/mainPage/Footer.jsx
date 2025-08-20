import React, { useState } from 'react';
import './Footer.css';

import Modal from './Modal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

function Footer() {
  const [openModal, setOpenModal] = useState(null);

  return (
    <footer className="footer-v3">
      <div className="footer-links-container">
        {/* 개인정보처리방침 */}
        <a
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            setOpenModal('privacy');
          }}
        >
          개인정보처리방침
        </a>

        {/* 이용약관 */}
        <a
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            setOpenModal('terms');
          }}
        >
          이용약관
        </a>
      </div>

      <p className="company-info">
        (주)보드게임 어시스턴스 대전광역시 서구 둔산로 123 (탄방동) 대표이사: 이정훈
        사업자등록번호: 123-45-67890 통신판매업신고: 2025-대전둔산-0001
      </p>
      <p className="copyright">
        © 2025 Boardgame Assistant Inc. All rights reserved.
      </p>

      {/* 모달 */}
      {openModal === 'privacy' && (
        <Modal onClose={() => setOpenModal(null)}>
          <PrivacyPolicy />
        </Modal>
      )}
      {openModal === 'terms' && (
        <Modal onClose={() => setOpenModal(null)}>
          <TermsOfService />
        </Modal>
      )}
    </footer>
  );
}

export default Footer;