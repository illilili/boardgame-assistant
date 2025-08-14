import { createContext } from 'react';

/**
 * 프로젝트 ID와 같은 프로젝트 관련 데이터를 하위 컴포넌트에 공유하기 위한 Context입니다.
 * 이 Context를 사용하면 props를 여러 단계로 전달할 필요 없이
 * 컴포넌트 트리 깊은 곳에서도 프로젝트 ID에 쉽게 접근할 수 있습니다.
 */
export const ProjectContext = createContext(null);
