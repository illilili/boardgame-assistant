import React, { useEffect, useState } from 'react';
import { getAllDevelopers, assignDeveloper } from '../../api/apiClient';
import Select from 'react-select';
import './DeveloperAssignModal.css';

const DeveloperAssignModal = ({ project, onClose }) => {
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState('');

  // 이름 마스킹 (가운데 글자 * 처리)
  const maskName = (name) => {
    if (!name) return "-";
    if (name.length === 2) return name[0] + "*";
    if (name.length > 2) return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    return name; // 한 글자면 그대로
  };

  // 이메일 마스킹 (@ 앞 2글자만 보이게)
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
    try {
      await assignDeveloper(project.projectId, selectedDev);
      alert('배정 완료!');
      onClose();
    } catch (err) {
      alert('배정 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{project.projectName} - 개발자 배정</h2>
        <Select
          options={developers.map(d => ({
            value: d.userId,
            label: `${maskName(d.name)} (${maskEmail(d.email)})`
          }))}
          value={developers.find(d => d.userId === selectedDev) 
            ? {
                value: selectedDev,
                label: `${maskName(developers.find(d => d.userId === selectedDev).name)} (${maskEmail(developers.find(d => d.userId === selectedDev).email)})`
              }
            : null}
          onChange={(opt) => setSelectedDev(opt.value)}
          placeholder="개발자 선택..."
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: 8,
              borderColor: state.isFocused ? '#E58A4E' : '#e5e7eb',
              boxShadow: state.isFocused ? '0 0 0 3px rgba(229,138,78,0.2)' : 'none',
              '&:hover': { borderColor: '#D4753A' },
              fontSize: '0.95rem',
            }),
            option: (base, state) => ({
              ...base,
              fontSize: '0.95rem',
              backgroundColor: state.isFocused ? '#fdf4eb' : '#fff',
              color: state.isFocused ? '#E58A4E' : '#333',
              cursor: 'pointer',
            }),
          }}
        />
        <div className="modal-actions">
          <button className="modal-button assign" onClick={handleAssign}>
            배정하기
          </button>
          <button className="modal-button close" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperAssignModal;
