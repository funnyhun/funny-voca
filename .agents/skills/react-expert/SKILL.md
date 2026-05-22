---
name: react-expert
description: React(Vite) 및 Next.js 클라이언트 바운더리 특화 컴포넌트 삼위일체 격리 및 데이터 바인딩 스킬
---

# react-expert 스킬 가이드

## [에이전트 전용: 빌드 타임 자동화 워크플로우 지침]
에이전트는 사용자가 신규 리액트 컴포넌트 설계를 지시했을 때, 실질적인 코드 작성을 수행하기 전 최우선으로 다음 워크플로우를 완수해야 한다.

1. **[룰 자동 이식]**: 본 스킬 패키지 하위의 `rules/react-expert-rule.md` 파일을 타겟 프로젝트의 `.agents/rules/react-expert-rule.md` (또는 `rules/` 디렉토리) 하위로 자동 복사(write_to_file)한다.
2. **[검증]**: 타겟 프로젝트의 규칙 폴더에 파일이 무결하게 생성되었는지 확인한 뒤, 안티그래비티 감시 엔진의 자동 감지가 개시되었음을 보고하고 본격적인 개발 코딩 단계에 진입한다.

---

## 1. 2선 아토믹 컴포넌트 격리 및 단일 .pen 연동 템플릿

에이전트는 Funny Todo 프로젝트에서 신규 컴포넌트를 설계할 때, 단일 파일에 스타일 객체와 컴포넌트 마크업을 혼합하지 않고 반드시 **2선 아토믹 파일 구조**를 구축하여 모듈화합니다.

또한, 컴포넌트별로 `.pen` 파일을 따로 생성하지 않고, 전체 디자인 스펙은 단일 파일인 `/.agents/funny-todo.pen`에서 통합 관리하고 동기화합니다.

### 1) 2선 아토믹 컴포넌트 격리 구조 예시 (`NeoButton`)
```
src/ui/Button/
├── index.tsx       # 본체 컴포넌트 및 상호작용 상태 로직 정의
└── Button.style.ts # CSSProperties 인라인 스타일 컬렉션 격리
```

### 2) 모범 템플릿 코드 세트

#### ① [index.tsx] - UI 마크업 및 로직 본체 (Next.js 가동 시 최상단 "use client" 선언)
```typescript
'use client';

import React from 'react';
import { styles } from './Button.style';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'ghost';
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  style = {},
  ...props 
}) => {
  // 격리된 스타일 객체 결합
  const variantStyle = styles[variant] || {};
  const combinedStyle: React.CSSProperties = {
    ...styles.button,
    ...variantStyle,
    ...style,
  };

  return (
    <button 
      className={`glass-button ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### ② [Button.style.ts] - CSSProperties 인라인 스타일 컬렉션 격리
```typescript
import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(14, 165, 233, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  primary: {
    background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    color: '#0369a1',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    color: '#475569',
  },
  success: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    color: '#047857',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    color: '#64748b',
  },
};
```

### 3) Pencil MCP 단일 디자인 시스템 파일 연동 실무

에이전트는 컴포넌트의 가시적 스타일이나 인터랙션을 새로 설계하거나 변경할 때 다음 가이드를 준수합니다.

- **[ ] 단일 파일 접근**: 반드시 `open_document` 툴의 인자로 `z:\home\minhulee\Projects\funny-todo\.agents\funny-todo.pen` 절대 경로를 지정하여 활성화합니다.
- **[ ] 컴포넌트 명세 누적 병합**: 신규 컴포넌트 개발 시, 해당 컴포넌트의 디자인 사양(theme, colorTone, tokens, states 등)을 단일 `.pen` 파일의 `components` 키 하위에 고유 컴포넌트 이름 객체로 신규 삽입하거나 수정 병합해야 합니다.
- **[ ] 코드 정합성 검증**: `.pen` 파일에 수록된 디자인 변수와 `style.ts` 파일 내 스타일링 수치(`padding`, `border`, `shadow` 등)가 1:1로 일치하는지 정밀 대조하여 상시 무결한 정합성을 검증합니다.

---

## 2. 라우터 및 데이터 로딩 환경에 따른 설계 대응법

리액트 컴포넌트는 실행 환경에 따라 데이터를 사전에 로딩하여 바인딩하는 전략을 다르게 취합니다.

### 1) 리액트 단독 SPA 환경 (React-Router-Dom Loader)
* **전략**: 컴포넌트 내부에서 비동기 데이터를 가져오기 위해 `useEffect` 훅을 남용하지 않고, `react-router`의 사전 Loader 아키텍처를 적용하여 뷰와 데이터를 매끄럽게 바인딩합니다.
```typescript
// src/router/loader/vocaLoader.ts
import { getVocaList } from '@/api/voca';

export async function vocaLoader() {
  const data = await getVocaList();
  return { vocaList: data };
}
```

### 2) Next.js 하이브리드 환경 (Server Component Data Injection)
* **전략**: 클라이언트 컴포넌트 스스로가 로딩 상태와 패칭 코드를 무겁게 내포하지 않도록 설계합니다. 
* **설계**: 최상위 서버 컴포넌트(`page.tsx`)로부터 사전 패칭이 완료된 깨끗한 데이터를 Props 형태로 즉시 주입받아, 구조분해 할당으로 즉각 렌더링에 돌입하게 만듭니다.
