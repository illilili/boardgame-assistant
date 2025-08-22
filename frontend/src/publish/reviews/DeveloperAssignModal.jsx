import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getAllDevelopers, assignDeveloper } from '../../api/apiClient';
import Select from 'react-select';
import './DeveloperAssignModal.css';

const DeveloperAssignModal = ({ project, onClose, onSuccess }) => {
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // 이름/이메일 마스킹 함수 (기존과 동일)
  const maskName = (name) => {
    if (!name) return "-";
    if (name.length === 2) return name[0] + "*";
    if (name.length > 2) return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    return name;
  };

  const maskEmail = (email) => {
    if (!email) return "-";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const visible = local.slice(0, 2);
    const hiddenCount = Math.max(0, local.length - 2);
    return `${visible}${"*".repeat(hiddenCount)}@${domain}`;
  };

  useEffect(() => {
    getAllDevelopers()
      .then(setDevelopers)
      .catch(err => console.error('개발자 목록 불러오기 실패:', err));
  }, []);

  const handleAssign = async () => {
    if (!selectedDev) {
      alert('개발자를 선택해주세요.');
      return;
    }
    setIsAssigning(true);
    try {
      await assignDeveloper(project.projectId, selectedDev.value);
      alert('배정이 완료되었습니다!');
      onSuccess(); // 성공 콜백 호출
      onClose();   // 모달 닫기
    } catch (err) {
      alert('배정 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsAssigning(false);
    }
  };
  
  const developerOptions = developers.map(d => ({
    value: d.userId,
    label: `${maskName(d.name)} (${maskEmail(d.email)})`
  }));

  return (
    <div className="dev-assign-modal-overlay" onClick={onClose}>
      <div className="dev-assign-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="dev-assign-modal__header">
          <h2 className="dev-assign-modal__title">개발자 배정</h2>
          <p className="dev-assign-modal__subtitle">
            '{project?.projectName || '프로젝트'}'
          </p>
        </header>

        <main className="dev-assign-modal__body">
          <Select
            options={developerOptions}
            value={selectedDev}
            onChange={setSelectedDev}
            placeholder="배정할 개발자를 선택하세요..."
            classNamePrefix="dev-assign-select" // CSS 스타일링을 위한 접두사
            isDisabled={isAssigning}
          />
        </main>

        <footer className="dev-assign-modal__actions">
          <button className="dev-assign-modal__button dev-assign-modal__button--close" onClick={onClose} disabled={isAssigning}>
            취소
          </button>
          <button className="dev-assign-modal__button dev-assign-modal__button--assign" onClick={handleAssign} disabled={!selectedDev || isAssigning}>
            {isAssigning ? '배정 중...' : '배정하기'}
          </button>
        </footer>
      </div>
    </div>
  );
};

DeveloperAssignModal.propTypes = {
  project: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default DeveloperAssignModal;