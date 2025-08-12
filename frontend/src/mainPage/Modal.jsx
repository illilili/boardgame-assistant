// Modal.js
import React from 'react';
import './Modal.css'; // 모달 전용 CSS 파일을 임포트합니다.

// children으로 모달 내부에 표시될 내용을 받고, onClose 함수를 통해 모달을 닫습니다.
function Modal({ children, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* 닫기 버튼 클릭 시 onClose 함수를 호출합니다. */}
                <button className="modal-close-btn" onClick={onClose}>×</button>
                {children} {/* 모달 내부에 전달된 내용을 렌더링합니다. */}
            </div>
        </div>
    );
}

export default Modal;
