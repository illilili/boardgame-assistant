// src/publish/TranslationWrapper.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../contexts/ProjectContext';
import Translation from './Translation';

const TranslationWrapper = () => {
  const { projectId } = useParams(); // URL에서 projectId 추출
  return (
    <ProjectContext.Provider value={{ projectId }}>
      <Translation />
    </ProjectContext.Provider>
  );
};

export default TranslationWrapper;
