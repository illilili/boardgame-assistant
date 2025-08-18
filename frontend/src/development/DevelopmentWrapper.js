// src/development/DevelopmentWrapper.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../contexts/ProjectContext';
import Development from './Development';

const DevelopmentWrapper = () => {
  const { projectId } = useParams(); // URL에서 projectId 추출
  return (
    <ProjectContext.Provider value={{ projectId }}>
      <Development />
    </ProjectContext.Provider>
  );
};

export default DevelopmentWrapper;
